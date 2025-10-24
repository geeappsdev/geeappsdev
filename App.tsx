import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import ChatInput from './components/ChatInput';
import ChatMessageComponent from './components/ChatMessage';
import SettingsModal from './components/SettingsModal';
import ScreenSaver from './components/ScreenSaver';
import { ChatMessage, MessageRole } from './types';
import { createChatSession, verifyApiKey } from './services/geminiService';

const IDLE_TIMEOUT = 5000; // 5 seconds

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55-.443.99-.98 1.135L5.85 7.21c-.917.25-1.567.933-1.567 1.85v.05c0 .62.32 1.2.859 1.52l2.245 1.213c.537.29.909.83.98 1.405l.25 2.023c.15.904.933 1.567 1.85 1.567h.05c.62 0 1.2-.32 1.52-.859l1.213-2.245c.29-.537.83-.909 1.405-.98l2.023-.25c.904-.15 1.567-.933 1.567-1.85v-.05c0-.62-.32-1.2-.859-1.52l-2.245-1.213a1.902 1.902 0 0 1-.98-1.405l-.25-2.023a1.902 1.902 0 0 0-1.567-1.85l-2.22-1.213A1.902 1.902 0 0 0 12.05 2.25h-.05a1.902 1.902 0 0 0-1.85 1.567L9.9 6.033a1.902 1.902 0 0 1-1.135.98l-2.22 1.213a1.902 1.902 0 0 0-1.52.859V12.05c0 .917.663 1.699 1.567 1.85l2.023.25c.55.07.99.443 1.135.98l1.213 2.22c.25.917.933 1.567 1.85 1.567h.05c.917 0 1.699-.663 1.85-1.567l.25-2.023a1.902 1.902 0 0 1 .98-1.135l2.245-1.213c.539-.32.859-.9.859-1.52v-.05c0-.917-.663-1.699-1.567-1.85l-2.023-.25a1.902 1.902 0 0 1-.98-1.135l-1.213-2.22a1.902 1.902 0 0 0-1.85-1.567h-.05Z" clipRule="evenodd" />
  </svg>
);


const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [isKeyValid, setIsKeyValid] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT);
  }, []);

  const handleUserActivity = useCallback(() => {
    setIsIdle(false);
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    if (isLoading) {
      // If a response is being generated, pause the idle timer.
      // The cleanup from the previous effect run has already removed listeners.
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      return; // Exit without setting up new timers or listeners.
    }

    // If not loading, reset the timer and listen for activity.
    resetIdleTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    // Cleanup function removes listeners and clears the timer
    // when the component unmounts or when `isLoading` becomes true.
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isLoading, handleUserActivity, resetIdleTimer]);
  

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initializeChat = useCallback(async (key: string) => {
    try {
      const isValid = await verifyApiKey(key);
      setIsKeyValid(isValid);
      if (isValid) {
        const session = createChatSession(key);
        setChatSession(session);
        setMessages([
          { role: MessageRole.MODEL, text: "Hello! I'm Gee, your Senior, Solution-Oriented Support Assistant AI. How can I assist you today?" }
        ]);
        setError(null);
      } else {
        setChatSession(null);
        setIsSettingsOpen(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during initialization.");
      setIsKeyValid(false);
      setChatSession(null);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      initializeChat(apiKey);
    } else {
      setIsSettingsOpen(true);
      setIsKeyValid(false);
    }
  }, []); // Run only on initial mount

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveApiKey = useCallback(async (newKey: string): Promise<boolean> => {
    const isValid = await verifyApiKey(newKey);
    if (isValid) {
      setApiKey(newKey);
      localStorage.setItem('gemini-api-key', newKey);
      await initializeChat(newKey);
      setIsSettingsOpen(false);
    } else {
      setIsKeyValid(false);
    }
    return isValid;
  }, [initializeChat]);


  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!chatSession || !isKeyValid) {
        setError("Chat session is not initialized or API key is invalid.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: MessageRole.USER, text: messageText };
    setMessages(prev => [...prev, userMessage, { role: MessageRole.MODEL, text: '' }]);

    try {
      const stream = await chatSession.sendMessageStream({ message: messageText });
      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = accumulatedText;
          return newMessages;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Error: ${errorMessage}`);
      setMessages(prev => prev.slice(0, -1)); 
    } finally {
      setIsLoading(false);
    }
  }, [chatSession, isKeyValid]);

  if (isIdle) {
    return <ScreenSaver />;
  }

  return (
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={handleSaveApiKey}
        initialApiKey={apiKey}
        theme={theme}
        setTheme={setTheme}
        isKeyRequired={!isKeyValid}
      />
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 z-10 flex items-center justify-between sticky top-0">
          <div className="w-8"></div> {/* Spacer */}
          <h1 className="text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
            GeeChat
          </h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-6 h-6"/>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {!isKeyValid && (
               <div className="bg-yellow-500/20 text-yellow-400 p-4 rounded-lg my-4 text-center">
                 Please set a valid Gemini API key in the settings to start chatting.
               </div>
            )}
            {messages.map((msg, index) => (
              <ChatMessageComponent key={index} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === MessageRole.MODEL && (
                <div className="flex items-start gap-4 my-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="max-w-xl xl:max-w-3xl px-5 py-3 rounded-2xl shadow-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-0"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-400"></div>
                      </div>
                  </div>
                </div>
            )}
            {error && (
              <div className="bg-red-500/20 text-red-300 p-3 rounded-lg max-w-4xl mx-auto my-4 text-center">
                {error}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        <footer className="sticky bottom-0 left-0 right-0">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !isKeyValid} />
        </footer>
      </div>
    </>
  );
};

export default App;