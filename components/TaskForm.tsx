
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { PRIORITY_LEVELS, TASK_CATEGORIES } from '../constants';
import Button from './Button';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || TASK_CATEGORIES[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
      setPriority(task.priority);
      setCategory(task.category);
    } else {
      // Reset form if no task is passed (for new task creation)
      setName('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setCategory(TASK_CATEGORIES[0]);
    }
    setError(''); // Clear error on task change
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task name is required.');
      return;
    }

    setError('');
    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string } = {
      id: task?.id,
      name,
      description: description || undefined,
      dueDate: dueDate || undefined,
      priority,
      category,
    };
    onSubmit(newTaskData);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support Web Speech API. Please use Chrome for this feature.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition started. Speak now.');
      // Optionally update UI to indicate recording
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      // Attempt to parse task name and optionally due date
      setName(transcript); // Set full transcript as name for simplicity
      // More advanced parsing could extract due dates, priorities, etc.
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setError(`Voice input error: ${event.error}. Try again.`);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended.');
      // Optionally update UI
    };

    recognition.start();
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Task Name
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 block w-full rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
            placeholder="e.g., Finish project report"
          />
          <Button type="button" onClick={handleVoiceInput} variant="secondary" className="rounded-l-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 6a6 6 0 01-6-6v-1.5m6 6v3.75m-3.75 0h7.5M12 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
          placeholder="Detailed notes about the task"
        ></textarea>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due Date (Optional)
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
        >
          {PRIORITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
        >
          {TASK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
