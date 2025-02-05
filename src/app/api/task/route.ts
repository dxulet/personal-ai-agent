import { NextRequest, NextResponse } from 'next/server';
import { processChatInput } from '../../lib/services/azure-openai';
import { createCalendarEvent, getCalendarEvents } from '../../lib/services/google-calendar';
import { ApiResponse, Task, ChatResponse } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, accessToken } = body;
    console.log('Received request:', { 
      text, 
      accessToken: accessToken ? accessToken.substring(0, 10) + '...' : null 
    });

    if (!text) {
      console.log('No text provided');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No text provided'
      }, { status: 400 });
    }

    // Get or create session ID for conversation memory
    let sessionId = req.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Process chat request
    console.log('Processing request with Azure OpenAI');
    const chatResponse: ChatResponse = await processChatInput(text, sessionId);
    console.log('Chat response:', chatResponse);

    // Handle function calls if present
    if (chatResponse.functionCall) {
      if (!accessToken) {
        return NextResponse.json<ApiResponse<ChatResponse>>({
          success: true,
          data: {
            message: "I need access to your Google Calendar to check your schedule. Please log in first.",
            suggestedActions: []
          }
        });
      }

      const { name, arguments: args } = chatResponse.functionCall;

      try {
        if (name === 'check_calendar') {
          const now = new Date();
          let startDate: Date;
          let endDate: Date;

          switch (args.timeframe) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
              break;
            case 'tomorrow':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
              break;
            case 'week':
              startDate = now;
              endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
              break;
            default:
              throw new Error('Invalid timeframe specified');
          }

          const events = await getCalendarEvents(
            accessToken,
            startDate.toISOString(),
            endDate.toISOString()
          );

          // Format events into a readable message
          if (events.length === 0) {
            chatResponse.message = `I checked your calendar and you have no events scheduled for ${args.timeframe}.`;
          } else {
            chatResponse.message = `Here are your events for ${args.timeframe}:\n`;
            events.forEach((event: any) => {
              const start = new Date(event.start.dateTime || event.start.date);
              const end = new Date(event.end.dateTime || event.end.date);
              chatResponse.message += `\n• ${event.summary} (${start.toLocaleTimeString()} - ${end.toLocaleTimeString()})`;
            });
          }

          // Add relevant suggested actions
          chatResponse.suggestedActions = [
            {
              type: 'schedule',
              description: `Schedule a new event for ${args.timeframe}`
            }
          ];
        } else if (name === 'schedule_event') {
          // Calculate end time based on start time and duration
          const startTime = new Date(args.startTime);
          const endTime = new Date(startTime.getTime() + args.duration * 60000); // Convert minutes to milliseconds

          const task: Task = {
            title: args.title,
            description: args.description || '',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            status: 'pending'
          };

          // Create the calendar event
          const event = await createCalendarEvent(task, accessToken);

          chatResponse.message = `Great! I've scheduled "${args.title}" for ${startTime.toLocaleString()}`;
          if (args.description) {
            chatResponse.message += ` with the description: ${args.description}`;
          }
          chatResponse.message += `. The event has been added to your calendar.`;

          // Add suggested actions for follow-up
          chatResponse.suggestedActions = [
            {
              type: 'info',
              description: 'Check my schedule'
            },
            {
              type: 'schedule',
              description: 'Schedule another event'
            }
          ];
        }
      } catch (error) {
        console.error('Error executing function:', error);
        chatResponse.message = "I encountered an error while working with your calendar. Please try again later.";
      }
    }

    const response = NextResponse.json<ApiResponse<ChatResponse>>({
      success: true,
      data: chatResponse
    });

    // Set session cookie if it's new
    if (!req.cookies.get('sessionId')) {
      response.cookies.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 