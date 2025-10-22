
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAISuggestionForWorkTime } from '../services/geminiService';
import { ProductivityData } from '../types';
import Button from '../components/Button';

interface AISuggestionDisplay {
  bestTime: string;
  reason: string;
}

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Dashboard must be used within an AppContext.Provider');
  }
  const { productivityData, tasks } = context;
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestionDisplay | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);

  const chartData = productivityData.map(data => ({
    date: data.date,
    'Completed Tasks': data.completedTasks,
    'Focus Minutes': data.focusMinutes,
  }));

  const fetchAISuggestion = async () => {
    setLoadingSuggestion(true);
    setErrorSuggestion(null);
    try {
      // Pass a simplified recent data to AI for analysis
      const recentData: ProductivityData[] = productivityData.slice(-7); // Last 7 days
      const suggestion = await getAISuggestionForWorkTime(recentData);
      if (suggestion) {
        setAiSuggestion(suggestion);
      } else {
        setErrorSuggestion("Failed to get AI suggestion. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching AI suggestion:", error);
      setErrorSuggestion("An error occurred while fetching AI suggestions.");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const totalTasksCompleted = tasks.filter(task => task.completed).length;
  const totalFocusMinutes = productivityData.reduce((sum, data) => sum + data.focusMinutes, 0);

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Your Productivity Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Tasks Completed</h2>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{totalTasksCompleted}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Focus Time</h2>
          <p className="text-5xl font-bold text-green-600 dark:text-green-400">{totalFocusMinutes} mins</p>
        </div>
      </div>

      {/* Productivity Trends Chart */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Productivity Trends (Last 7 Days)</h2>
        {productivityData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No productivity data available yet. Start completing tasks and focusing!</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData.slice(-7)} // Show last 7 days
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
              <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                     stroke="#6b7280" className="dark:text-gray-400"/>
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" className="dark:text-blue-400"/> {/* Blue for Completed Tasks */}
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" className="dark:text-green-400"/> {/* Green for Focus Minutes */}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tw-bg-gray-100)',
                  borderColor: 'var(--tw-border-gray-300)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                }}
                itemStyle={{
                  color: 'var(--tw-text-gray-900)',
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Completed Tasks" stroke="#3b82f6" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="Focus Minutes" stroke="#10b981" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* AI Features: Suggest best times */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">AI Productivity Insights</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Based on your past behavior, let AI suggest the best times for you to work or study.
        </p>
        <Button onClick={fetchAISuggestion} disabled={loadingSuggestion} variant="primary">
          {loadingSuggestion ? 'Thinking...' : 'Get AI Suggestion'}
        </Button>

        {errorSuggestion && (
          <p className="text-red-500 mt-4">{errorSuggestion}</p>
        )}

        {aiSuggestion && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md border border-blue-200 dark:border-blue-700">
            <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Best Time to Focus: <span className="text-blue-600 dark:text-blue-400">{aiSuggestion.bestTime}</span>
            </h3>
            <p className="text-blue-700 dark:text-blue-300">{aiSuggestion.reason}</p>
          </div>
        )}
        {!aiSuggestion && !loadingSuggestion && !errorSuggestion && (
           <p className="mt-4 text-gray-500 dark:text-gray-400">Click the button to get personalized AI suggestions.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
