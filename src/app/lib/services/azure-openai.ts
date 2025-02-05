import { AzureChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ProcessedTask, ChatResponse } from "../../types";
import { z } from "zod";
import { AIMessage, HumanMessage, BaseMessage, FunctionMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

if (!process.env.AZURE_OPENAI_API_KEY) {
  throw new Error("AZURE_OPENAI_API_KEY is not set");
}

if (!process.env.AZURE_OPENAI_ENDPOINT) {
  throw new Error("AZURE_OPENAI_ENDPOINT is not set");
}

// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessingError';
  }
}

// Input validation schema
const inputSchema = z.object({
  input: z.string()
    .min(1, "Input cannot be empty")
    .max(500, "Input is too long. Please keep it under 500 characters")
    .refine(
      (val) => !(/[<>{}]/.test(val)),
      "Input contains invalid characters"
    )
});

// Task schema
const taskSchema = z.object({
  task: z.object({
    title: z.string()
      .min(1, "Title cannot be empty")
      .max(100, "Title is too long"),
    description: z.string()
      .max(1000, "Description is too long")
      .optional(),
    startTime: z.string()
      .refine(
        (val: string) => !isNaN(Date.parse(val)),
        "Invalid start time format"
      ),
    endTime: z.string()
      .refine(
        (val: string) => !isNaN(Date.parse(val)),
        "Invalid end time format"
      )
  }).refine(
    (data) => {
      const startTime = Date.parse(data.startTime);
      const endTime = Date.parse(data.endTime);
      return endTime > startTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"]
    }
  ),
  confidence: z.number()
    .min(0, "Confidence must be between 0 and 1")
    .max(1, "Confidence must be between 0 and 1"),
  needsClarification: z.boolean(),
  clarificationQuestions: z.array(z.string()).optional()
});

// Chat response schema
const chatResponseSchema = z.object({
  message: z.string(),
  suggestedActions: z.array(
    z.object({
      type: z.enum(["schedule", "modify", "info"]),
      description: z.string()
    })
  ).optional()
});

// Create output parsers
const outputParser = StructuredOutputParser.fromZodSchema(taskSchema);
const chatOutputParser = StructuredOutputParser.fromZodSchema(chatResponseSchema);

// Define function schemas
const checkCalendar = {
  name: "check_calendar",
  description: "Check the user's calendar for events in a specific time range",
  parameters: {
    type: "object",
    properties: {
      timeframe: {
        type: "string",
        enum: ["today", "tomorrow", "week"],
        description: "The time period to check"
      }
    },
    required: ["timeframe"]
  }
};

const suggestMeetingTime = {
  name: "suggest_meeting_time",
  description: "Suggest available time slots for a meeting based on calendar availability",
  parameters: {
    type: "object",
    properties: {
      duration: {
        type: "number",
        description: "Duration of the meeting in minutes"
      },
      preferred_time: {
        type: "string",
        description: "Preferred time of day (morning, afternoon, evening)"
      }
    },
    required: ["duration"]
  }
};

const scheduleEvent = {
  name: "schedule_event",
  description: "Schedule a new event in the calendar",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title of the event"
      },
      description: {
        type: "string",
        description: "Description of the event (optional)"
      },
      startTime: {
        type: "string",
        description: "Start time in ISO format (e.g., 2024-02-07T14:00:00)"
      },
      duration: {
        type: "number",
        description: "Duration in minutes"
      }
    },
    required: ["title", "startTime", "duration"]
  }
};

// Create a LangChain model instance
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: "2024-05-01-preview",
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_MODEL,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT?.replace("https://", "").replace(".openai.azure.com/", ""),
  temperature: 0
});

// Create a memory instance with message history
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "output"
});

// Create a conversation chain
const chain = new ConversationChain({
  llm: model,
  memory: memory,
});

// Create a chat prompt template with function calling support
const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI assistant that helps users plan and manage their tasks and schedule.
Your job is to help users understand their schedule, plan their day, and manage their time effectively.

Guidelines for responses:
1. Be conversational and helpful
2. When discussing times, be specific and clear
3. Offer suggestions when appropriate
4. Help users plan their day effectively

When users ask about their schedule or availability:
- Use the check_calendar function to fetch their calendar events

When users want to schedule something:
- Use the schedule_event function to create calendar events
- Make sure to specify the title, start time, and duration
- Add a description if provided by the user

Current time: {current_time}
User's timezone: {timezone}`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"]
]);

// Create prompt templates
const promptTemplate = new PromptTemplate({
  template: `You are an AI assistant that helps users schedule tasks.
Your job is to extract task information from user input and format it properly.

Current time: {current_time}
User's timezone: {timezone}

Previous conversation context:
{chat_history}

CRITICAL SCHEDULING RULES:
- ANY TIME MENTIONED IS THE START TIME, NEVER THE END TIME
- For "meeting at 2pm", startTime MUST BE 2:00 PM
- For "call at 3pm", startTime MUST BE 3:00 PM
- ALWAYS calculate endTime by adding duration to startTime

When handling dates and times:
1. Start Time Rules:
   - MENTIONED TIME = START TIME (ALWAYS)
   - Examples of CORRECT scheduling:
     * "meeting at 2pm" → startTime: 2:00 PM, endTime: 3:00 PM
     * "call at 3pm" → startTime: 3:00 PM, endTime: 4:00 PM
     * "sync at 10am" → startTime: 10:00 AM, endTime: 11:00 AM
   - If only a date is mentioned (e.g., "tomorrow"), default to 9:00 AM
   - For "morning", use 9:00 AM
   - For "afternoon", use 2:00 PM
   - For "evening", use 6:00 PM
   - For "night", use 8:00 PM

2. Time Interpretation:
   - For times without AM/PM:
     * 1-6 means PM (13:00-18:00)
     * 7-11 means AM (07:00-11:00)
     * 12 means PM (12:00)
   - "Noon" = 12:00 PM
   - "Midnight" = 00:00

3. Date Handling:
   - "Tomorrow" = next day from current time
   - "Next [day]" = next occurrence of that day
   - "This [day]" = this week's occurrence if future, next week's if past
   - Always use the current time ({current_time}) as reference point

4. Duration:
   - If no duration specified, default to 1 hour
   - "Quick" meetings = 30 minutes
   - "Brief" meetings = 30 minutes
   - "Long" meetings = 2 hours

VALIDATION:
1. If user says "at X:XX", the startTime MUST be X:XX
2. The endTime MUST be later than startTime
3. The difference between endTime and startTime MUST match the duration rules above

Always return times in ISO 8601 format with timezone offset.
If time is ambiguous or missing, set needsClarification to true and ask specific questions.

{format_instructions}

User input: {input}`,
  inputVariables: ["input", "current_time", "timezone", "chat_history"],
  partialVariables: {
    format_instructions: outputParser.getFormatInstructions()
  }
});

// Helper function to validate dates
function validateDateTime(date: string): boolean {
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed.getTime());
}

export async function processChatInput(input: string, sessionId?: string): Promise<ChatResponse> {
  try {
    console.log('Processing chat input:', input);

    // Validate input
    try {
      await inputSchema.parseAsync({ input });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }
    
    // Get current time and timezone with validation
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) {
      throw new ValidationError("Could not determine user timezone");
    }
    
    const current_time = now.toLocaleString('en-US', { timeZone: timezone });
    
    // Get chat history from memory and ensure it's an array of messages
    const memoryVars = await memory.loadMemoryVariables({});
    const chatHistory = memoryVars.chat_history || [];
    
    // Format messages for the chat
    const messages = await chatPromptTemplate.formatMessages({
      current_time: current_time,
      timezone: timezone,
      chat_history: chatHistory,
      input: input
    });

    // Get the response with timeout and retry logic
    let response: AIMessage;
    try {
      const result = await Promise.race([
        model.invoke(messages, {
          functions: [checkCalendar, scheduleEvent]
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]);
      
      if (!(result instanceof AIMessage)) {
        throw new ProcessingError("Invalid response format from model");
      }
      
      response = result;

      // Save the conversation to memory
      await memory.saveContext(
        { input: input },
        { output: response.content }
      );

      // Handle function calls if present
      if (response.additional_kwargs.function_call) {
        const functionCall = response.additional_kwargs.function_call;
        console.log('Function call detected:', functionCall);

        // Parse function arguments
        const args = JSON.parse(functionCall.arguments);

        // Return a response that indicates a function call is needed
        return {
          message: "Let me check your calendar...",
          functionCall: {
            name: functionCall.name,
            arguments: args
          },
          suggestedActions: []
        };
      }

      // Parse and validate the response
      try {
        const parsedResponse = await chatOutputParser.parse(response.content.toString());
        return parsedResponse;
      } catch (error) {
        console.error("Failed to parse chat response, using fallback:", error);
        // Attempt to extract just the message content if JSON parsing fails
        const content = response.content.toString();
        return {
          message: content.replace(/```json\s*|\s*```/g, '').replace(/\{|\}|\[|\]|"|'/g, ''),
          suggestedActions: []
        };
      }
    } catch (error) {
      throw new ProcessingError("Failed to get model response: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  } catch (error) {
    console.error("Error processing chat input:", error);
    throw error;
  }
} 