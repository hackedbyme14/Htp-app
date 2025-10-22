
import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../types';
import Button from './Button';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 6 for Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayTasks = useMemo(() => {
    const taskMap = new Map<string, Task[]>(); // Map<YYYY-MM-DD, Task[]>
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate;
        if (!taskMap.has(dateKey)) {
          taskMap.set(dateKey, []);
        }
        taskMap.get(dateKey)?.push(task);
      }
    });
    return taskMap;
  }, [tasks]);

  const renderCalendarDays = () => {
    const days = [];

    // Fill leading empty days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-prev-${i}`} className="p-2 text-center text-gray-400 dark:text-gray-600"></div>);
    }

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const tasksForDay = getDayTasks.get(dateString) || [];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={`day-${day}`}
          className={`p-2 border border-gray-200 dark:border-gray-700 relative flex flex-col justify-between cursor-pointer
                      ${isToday ? 'bg-blue-100 dark:bg-blue-900 border-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          onClick={() => { /* Optionally show tasks in a modal for this day */ }}
        >
          <span className={`font-semibold ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
            {day}
          </span>
          <div className="flex flex-col gap-1 mt-1 overflow-auto max-h-16 text-xs">
            {tasksForDay.map(task => (
              <span
                key={task.id}
                className={`truncate px-1 py-0.5 rounded-md ${
                  task.completed ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                  task.priority === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                  'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                }`}
                onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                title={task.name}
              >
                {task.name}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevMonth} variant="secondary" size="sm">Prev</Button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <Button onClick={nextMonth} variant="secondary" size="sm">Next</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-gray-600 dark:text-gray-300">
        {weekdays.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm h-[320px]"> {/* Fixed height for calendar grid */}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarView;
