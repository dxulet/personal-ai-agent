'use client';

import { useState, useEffect } from 'react';
import ChatMessages from './components/ChatMessages';
import ThemeToggle from './components/ThemeToggle';
import AIInputWithLoading from '../components/ui/ai-input-with-loading';
import { UserInput, ChatResponse } from './types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<{
    role: 'user' | 'assistant';
    content: string;
    suggestedActions?: ChatResponse['suggestedActions'];
    isLoading?: boolean;
  }[]>([]);

  useEffect(() => {
    // Check for error parameter
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(errorMsg);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      return;
    }

    // Check for tokens in URL hash
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('access_token');
      const expiry = hashParams.get('expiry_date');
      
      if (token && expiry) {
        const tokenData = {
          access_token: token,
          expiry_date: Number(expiry)
        };
        localStorage.setItem('googleTokens', JSON.stringify(tokenData));
        setAccessToken(token);
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
        return;
      }
    }

    // Check localStorage for existing tokens
    const storedTokens = localStorage.getItem('googleTokens');
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        if (tokens.expiry_date && new Date().getTime() < tokens.expiry_date) {
          setAccessToken(tokens.access_token);
        } else {
          localStorage.removeItem('googleTokens');
          setAccessToken(null);
        }
      } catch (err) {
        localStorage.removeItem('googleTokens');
        console.error('Error parsing stored tokens:', err);
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('googleTokens');
  };

  const handleTaskSubmit = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message and temporary loading message
      const userMessage = { role: 'user' as const, content: text };
      const loadingMessage = { role: 'assistant' as const, content: '', isLoading: true };
      
      setMessages(prev => [...prev, userMessage, loadingMessage]);

      const response = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text,
          accessToken: accessToken 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process request');
      }

      const chatResponse = data.data as ChatResponse;
      
      // Replace the loading message with the actual response
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove loading message
        {
          role: 'assistant',
          content: chatResponse.message,
          suggestedActions: chatResponse.suggestedActions,
          isLoading: false
        }
      ]);

    } catch (err) {
      // Remove loading message and show error
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again.',
          isLoading: false
        }
      ]);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { type: string; description: string }) => {
    if (action.description === 'Login with Google Calendar') {
      handleLogin();
    } else {
      handleTaskSubmit(action.description);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <ThemeToggle />
      
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">AI Task Assistant</h1>
      
      {!accessToken ? (
        <button
          onClick={handleLogin}
          className="mb-8 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
        >
          Login with Google Calendar
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="mb-8 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      )}
      
      {messages.length > 0 && (
        <ChatMessages 
          messages={messages} 
          onActionClick={handleActionClick}
        />
      )}
      
      <AIInputWithLoading
        onSubmit={handleTaskSubmit}
        isLoading={isLoading}
        placeholder="Chat with me about your schedule..."
        className="max-w-2xl"
      />
      
      {error && (
        <div className="w-full max-w-2xl mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
    </main>
  );
}