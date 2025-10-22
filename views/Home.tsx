
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { HashLink as Link } from 'react-router-hash-link';
import Button from '../components/Button';

const Home: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Home must be used within an AppContext.Provider');
  }
  const { tasks, productivityData } = context;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const completedTasksToday = productivityData.find(d => d.date === today)?.completedTasks || 0;
  const activeTasks = tasks.filter(task => !task.completed).length;

  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center">
        Welcome to Productivity Hub!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between h-40">
          <h2 className="text-xl font-semibold mb-2">Today's Progress</h2>
          <p className="text-5xl font-bold">{completedTasksToday}</p>
          <p className="text-sm">Tasks Completed</p>
        </div>

        {/* Active Tasks Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-40 flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Active Tasks</h2>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{activeTasks}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tasks remaining</p>
        </div>

        {/* Motivation Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-40 flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Daily Motivation</h2>
          <p className="text-md italic text-gray-700 dark:text-gray-300">"{randomQuote.quote}"</p>
          <p className="text-sm text-right font-light text-gray-500 dark:text-gray-400">- {randomQuote.author}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <Link to="#planner">
          <Button className="w-full py-4 text-lg bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600">
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              Go to Planner
            </span>
          </Button>
        </Link>
        <Link to="#focus">
          <Button className="w-full py-4 text-lg bg-purple-500 hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-600">
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Start Focus Session
            </span>
          </Button>
        </Link>
        <Link to="#dashboard">
          <Button className="w-full py-4 text-lg bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-600">
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              View Dashboard
            </span>
          </Button>
        </Link>
      </div>

      <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
        <p>Your journey to peak productivity starts here.</p>
      </div>
    </div>
  );
};

export default Home;
