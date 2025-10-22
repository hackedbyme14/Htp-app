
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import Button from './Button';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onViewReminders: (taskId: string, taskName: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewReminders,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortKey, setSortKey] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = tasks;
    if (filter === 'active') {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortKey === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority]; // High priority first
      } else if (sortKey === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filter, sortKey, sortOrder]);

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBgColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'low':
        return 'bg-green-100 dark:bg-green-900';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'secondary'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Completed
        </Button>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as 'dueDate' | 'priority' | 'createdAt')}
          className="ml-auto p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md text-sm"
        >
          <option value="createdAt">Created Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
        <Button
          variant="secondary"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          size="sm"
        >
          {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
        </Button>
      </div>

      {filteredAndSortedTasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No tasks found. Add a new task!</p>
      ) : (
        <ul className="space-y-3">
          {filteredAndSortedTasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm
                          ${task.completed ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-900'}`}
            >
              <div className="flex items-center flex-grow min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                  className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                />
                <div className="flex-grow min-w-0">
                  <h3
                    className={`text-lg font-semibold truncate ${
                      task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {task.name}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {task.dueDate && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 12h.01m-.01 2h.01m11-4h.01m0 2h.01M13 16h.01M13 18h.01"></path></svg>
                        {task.dueDate}
                      </span>
                    )}
                    <span className={`font-medium px-2 py-0.5 rounded-full ${getPriorityBgColor(task.priority)} ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium">
                      {task.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button variant="secondary" size="sm" onClick={() => onViewReminders(task.id, task.name)}>
                  Reminders
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(task.id)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
