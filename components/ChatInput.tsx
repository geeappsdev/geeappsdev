import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const suggestionPrompts = [
    { label: 'Email', value: 'EO: ' },
    { label: 'Internal Note', value: 'INV: ' },
    { label: 'Chat/RAC Note', value: 'CL: ' },
    { label: 'Consult', value: 'CF: ' },
    { label: 'Quick Summary', value: 'QS: ' },
];


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (value: string) => {
    setInput(value);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 shadow-inner">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-2 px-2">
            {suggestionPrompts.map((prompt) => (
                <button
                key={prompt.label}
                onClick={() => handleSuggestionClick(prompt.value)}
                disabled={isLoading}
                className="px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {prompt.label}
                </button>
            ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here, or select a format..."
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-300 ring-1 ring-inset ring-gray-200 dark:ring-0"
            autoComplete="off"
            />
            <button
            type="submit"
            disabled={isLoading}
            aria-label="Send message"
            className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
            <SendIcon className="w-6 h-6" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;