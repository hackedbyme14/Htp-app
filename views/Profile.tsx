
import React, { useState, useEffect } from 'react';

const Profile: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme from document class or system preference
    const html = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      html.classList.add('dark');
    } else {
      setIsDarkMode(false);
      html.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Profile & Settings</h1>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <label htmlFor="dark-mode-toggle" className="text-lg text-gray-700 dark:text-gray-300">
            Dark Mode
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="dark-mode-toggle"
              id="dark-mode-toggle"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-200 border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
            />
            <label
              htmlFor="dark-mode-toggle"
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"
            ></label>
          </div>
        </div>
        {/* Fix: Removed non-standard 'jsx' prop from the style tag */}
        <style>{`
          .toggle-checkbox:checked {
            transform: translateX(100%);
            @apply border-blue-600;
          }
          .toggle-checkbox:checked + .toggle-label {
            @apply bg-blue-600;
          }
          .toggle-checkbox {
            left: 0;
          }
          .toggle-checkbox:checked {
            left: calc(100% - 1.5rem); /* Adjust based on checkbox width */
          }
        `}</style>
      </section>

      {/* Add more profile settings here if needed */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">About the App</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Productivity Hub is designed to help you stay organized and focused.
          Manage your tasks, set reminders, utilize the Pomodoro technique, and get motivational insights.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Built with React, TypeScript, and Tailwind CSS. AI features powered by Google Gemini API.
        </p>
      </section>
    </div>
  );
};

export default Profile;
