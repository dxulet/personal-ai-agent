"use client";

import { ChatResponse } from "../types";
import { TextShimmer } from "../../components/ui/text-shimmer";

interface ChatMessagesProps {
  messages: {
    role: "user" | "assistant";
    content: string;
    suggestedActions?: ChatResponse["suggestedActions"];
    isLoading?: boolean;
  }[];
  onActionClick?: (action: { type: string; description: string }) => void;
}

export default function ChatMessages({
  messages,
  onActionClick,
}: ChatMessagesProps) {
  return (
    <div className="w-full max-w-2xl space-y-4 mb-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            {message.role === "assistant" && message.isLoading ? (
              <div className="text-gray-800 dark:text-gray-200">
                <TextShimmer>Thinking...</TextShimmer>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {message.content}
              </p>
            )}

            {message.suggestedActions &&
              message.suggestedActions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Suggested actions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.suggestedActions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => onActionClick?.(action)}
                        className={
                          message.role === "user"
                            ? "text-sm px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                            : "text-sm px-3 py-1 rounded-full bg-white hover:bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                        }
                      >
                        {action.description}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
