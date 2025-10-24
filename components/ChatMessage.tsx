import React, { useMemo } from 'react';
import { ChatMessage, MessageRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

// Declare marked as a global variable
declare global {
    interface Window {
        marked: any;
    }
}


const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
    </div>
);

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
       </svg>
    </div>
);

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === MessageRole.MODEL;

  const renderedHtml = useMemo(() => {
    if (isModel && window.marked) {
      const rawMarkup = window.marked.parse(message.text);
      return { __html: rawMarkup };
    }
    return null;
  }, [message.text, isModel]);


  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      {isModel ? <ModelIcon/> : <UserIcon/>}
      <div className={`max-w-xl xl:max-w-3xl px-5 py-3 rounded-2xl shadow-md ${isModel ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
          {isModel && renderedHtml ? (
               <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={renderedHtml} />
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;