
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { MOTIVATIONAL_QUOTES } from '../constants';
import Button from '../components/Button';

const Motivation: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Motivation must be used within an AppContext.Provider');
  }
  const { tasks, productivityData } = context;

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Set initial random quote
    const initialIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentQuoteIndex(initialIndex);
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const previousQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];

  // Calculate Streak
  const streak = useMemo(() => {
    const sortedProdData = [...productivityData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (let i = sortedProdData.length - 1; i >= 0; i--) {
      const data = sortedProdData[i];
      const date = new Date(data.date);
      date.setHours(0, 0, 0, 0); // Normalize to start of day

      if (data.completedTasks > 0) {
        if (!lastDate) {
          // If it's today and tasks were completed, start/continue streak
          if (date.toDateString() === new Date().toDateString()) {
            currentStreak = 1;
            lastDate = date;
          } else if (date.toDateString() === new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toDateString()) {
             // If it was yesterday and tasks were completed, start/continue streak from yesterday
            currentStreak = 1;
            lastDate = date;
          }
        } else {
          const dayDiff = (lastDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
          if (dayDiff === 1) { // Consecutive day
            currentStreak++;
            lastDate = date;
          } else if (dayDiff > 1) { // Gap found
            break;
          }
        }
      } else {
         if (lastDate === null && date.toDateString() === new Date().toDateString()) {
            // If today has no completed tasks, but we haven't started counting a streak yet, this day doesn't contribute
            continue;
         }
         // If there's a day without completed tasks, and it's not today with an un-started streak, the streak is broken
         if (lastDate !== null && date.toDateString() !== new Date().toDateString()) {
             break;
         }
      }
    }

    if (currentStreak > 0 && lastDate && lastDate.toDateString() !== new Date().toDateString() && productivityData.find(d => d.date === new Date().toISOString().split('T')[0])?.completedTasks === 0) {
        // If the last day of streak is not today, and today has no tasks completed, the streak should be '0' or end yesterday.
        return 0;
    }

    return currentStreak;
  }, [productivityData]);


  const totalCompletedTasks = tasks.filter(task => task.completed).length;

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Stay Motivated!</h1>

      {/* Motivational Quote Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Dose of Inspiration</h2>
        <p className="text-2xl italic text-gray-800 dark:text-gray-200 mb-4 text-center">"{currentQuote.quote}"</p>
        <p className="text-lg font-light text-gray-600 dark:text-gray-400 text-right w-full pr-4">- {currentQuote.author}</p>
        <div className="flex gap-4 mt-6">
          <Button onClick={previousQuote} variant="secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Prev
          </Button>
          <Button onClick={nextQuote} variant="primary">
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Streak 🔥</h2>
          <p className="text-6xl font-extrabold text-red-500 dark:text-red-400">{streak}</p>
          <p className="text-md text-gray-600 dark:text-gray-400">Consecutive days with tasks completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tasks Completed All Time</h2>
          <p className="text-6xl font-extrabold text-blue-500 dark:text-blue-400">{totalCompletedTasks}</p>
          <p className="text-md text-gray-600 dark:text-gray-400">Great work!</p>
        </div>
      </div>
    </div>
  );
};

export default Motivation;
