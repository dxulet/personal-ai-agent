'use client';

import { useState } from 'react';
import { UserInput } from '../types';
import { TextShimmer } from '../../components/ui/text-shimmer';

interface TaskInputProps {
  onSubmit: (input: UserInput) => void;
  isLoading: boolean;
}

export default function TaskInput({ onSubmit, isLoading }: TaskInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit({ text: text.trim() });
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chat with me about your schedule (e.g., 'What's my schedule for tomorrow?' or 'Schedule a team meeting tomorrow at 2 PM')"
          className="w-full p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            isLoading || !text.trim()
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <TextShimmer 
              duration={1}
              className="text-white dark:text-gray-200"
            >
              Processing request...
            </TextShimmer>
          ) : (
            'Send Message'
          )}
        </button>
      </div>
    </form>
  );
}