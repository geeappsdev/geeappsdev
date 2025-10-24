import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => Promise<boolean>;
  initialApiKey: string | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isKeyRequired: boolean;
}

const SunIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 1 0 1.06l-1.591 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.591a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75ZM17.894 17.894a.75.75 0 0 1 1.06 0l1.59 1.591a.75.75 0 1 1-1.06 1.06l-1.591-1.59a.75.75 0 0 1 0-1.06ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.894a.75.75 0 0 1 0-1.06l-1.59-1.591a.75.75 0 0 1-1.061 1.06l1.59 1.59a.75.75 0 0 1 1.06 0ZM6.106 7.166a.75.75 0 0 1 1.06 0l1.59 1.591a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM3 12a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 3 12Z" />
  </svg>
);

const MoonIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5c0-1.562.337-3.05 1.002-4.425a.75.75 0 0 1 .819-.162Z" clipRule="evenodd" />
  </svg>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaveKey, initialApiKey, theme, setTheme, isKeyRequired }) => {
  const [apiKey, setApiKeyInput] = useState(initialApiKey || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setApiKeyInput(initialApiKey || '');
  }, [initialApiKey, isOpen]);
  
  const handleSave = async () => {
    setIsVerifying(true);
    setVerificationStatus('idle');
    const success = await onSaveKey(apiKey);
    setVerificationStatus(success ? 'success' : 'error');
    setIsVerifying(false);
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" 
        aria-labelledby="settings-title" 
        role="dialog" 
        aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 text-gray-900 dark:text-white transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 id="settings-title" className="text-2xl font-bold">Settings</h2>
          {!isKeyRequired && (
            <button onClick={onClose} aria-label="Close settings" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* API Key Section */}
        <div className="space-y-2">
          <label htmlFor="api-key" className="block font-semibold text-sm">Gemini API Key</label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your key is stored only in your browser.
          </p>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSave}
            disabled={isVerifying}
            className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isVerifying ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Save & Verify Key"}
          </button>
          {verificationStatus === 'success' && <p className="text-sm text-green-500 mt-2">API Key verified and saved successfully!</p>}
          {verificationStatus === 'error' && <p className="text-sm text-red-500 mt-2">Invalid API Key. Please check and try again.</p>}
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {/* Theme Section */}
        <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Interface Theme</span>
            <button onClick={handleToggleTheme} className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500">
                <span className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                 <span className={`absolute left-1.5 top-1 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}><SunIcon className="w-4 h-4 text-yellow-500" /></span>
                 <span className={`absolute right-1.5 top-1 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}><MoonIcon className="w-4 h-4 text-indigo-300" /></span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
