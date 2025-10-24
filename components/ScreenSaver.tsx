import React, { useState, useEffect } from 'react';

const ScreenSaver: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 cursor-pointer animate-fade-in">
      <div className="text-7xl md:text-9xl font-sans font-bold tracking-tight">
        {timeString}
      </div>
      <div className="text-xl md:text-3xl font-sans mt-4 text-gray-500 dark:text-gray-400">
        {dateString}
      </div>
    </div>
  );
};

export default ScreenSaver;
