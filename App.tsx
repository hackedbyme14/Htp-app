
import React, { useState, useEffect, useCallback, createContext } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Planner from './views/Planner';
import FocusMode from './views/FocusMode';
import Motivation from './views/Motivation';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import AlarmNotifier from './components/AlarmNotifier';
import { Task, Reminder, ProductivityData } from './types';

// Define a context type
interface AppContextType {
  tasks: Task[];
  reminders: Reminder[];
  productivityData: ProductivityData[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (updatedTask: Omit<Task, 'createdAt' | 'completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (updatedReminder: Omit<Reminder, 'triggeredAt'>) => void;
  deleteReminder: (id: string) => void;
  snoozeReminder: (reminderId: string) => void;
  dismissReminder: (reminderId: string) => void;
  addFocusMinutes: (minutes: number) => void;
}

// Create context with a default undefined value
export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContent: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();

  // Load data from localStorage on initial mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));

    const storedReminders = localStorage.getItem('reminders');
    if (storedReminders) setReminders(JSON.parse(storedReminders));

    const storedProductivityData = localStorage.getItem('productivityData');
    if (storedProductivityData) setProductivityData(JSON.parse(storedProductivityData));

    // Initialize dark mode from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('productivityData', JSON.stringify(productivityData));
  }, [productivityData]);

  // Update active tab based on hash route
  useEffect(() => {
    const path = location.hash.substring(1); // Remove '#'
    if (path) {
      setActiveTab(path);
    } else {
      setActiveTab('home'); // Default to home if no hash
    }
  }, [location.hash]);

  const addTask = useCallback((newTaskPartial: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      { ...newTaskPartial, id: uuidv4(), completed: false, createdAt: new Date().toISOString() },
    ]);
  }, []);

  const updateTask = useCallback((updatedTaskPartial: Omit<Task, 'createdAt' | 'completed'>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTaskPartial.id ? { ...task, ...updatedTaskPartial } : task))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    setReminders((prevReminders) => prevReminders.filter((reminder) => reminder.taskId !== id));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      const completedTask = updatedTasks.find(task => task.id === id && task.completed);
      if (completedTask) {
        addCompletedTaskToProductivity();
      }
      return updatedTasks;
    });
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  const addReminder = useCallback((newReminderPartial: Omit<Reminder, 'id'>) => {
    setReminders((prevReminders) => [
      ...prevReminders,
      { ...newReminderPartial, id: uuidv4() },
    ]);
  }, []);

  const updateReminder = useCallback((updatedReminderPartial: Omit<Reminder, 'triggeredAt'>) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === updatedReminderPartial.id ? { ...reminder, ...updatedReminderPartial } : reminder
      )
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prevReminders) => prevReminders.filter((reminder) => reminder.id !== id));
  }, []);

  const snoozeReminder = useCallback((reminderId: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              // Snooze for 5 minutes
              time: new Date(new Date().getTime() + 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              triggeredAt: undefined, // Reset trigger to allow it to fire again
            }
          : r
      )
    );
  }, []);

  const dismissReminder = useCallback((reminderId: string) => {
    setReminders((prevReminders) =>
      prevReminders.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              triggeredAt: new Date().toISOString(), // Mark as triggered now
              enabled: r.repeat !== 'none', // Disable if not repeating
            }
          : r
      )
    );
  }, []);

  const addCompletedTaskToProductivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setProductivityData((prevData) => {
      const existingEntryIndex = prevData.findIndex((data) => data.date === today);
      if (existingEntryIndex > -1) {
        const newData = [...prevData];
        newData[existingEntryIndex] = {
          ...newData[existingEntryIndex],
          completedTasks: newData[existingEntryIndex].completedTasks + 1,
        };
        return newData;
      } else {
        return [...prevData, { date: today, completedTasks: 1, focusMinutes: 0 }];
      }
    });
  }, []);

  const addFocusMinutes = useCallback((minutes: number) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setProductivityData((prevData) => {
      const existingEntryIndex = prevData.findIndex((data) => data.date === today);
      if (existingEntryIndex > -1) {
        const newData = [...prevData];
        newData[existingEntryIndex] = {
          ...newData[existingEntryIndex],
          focusMinutes: newData[existingEntryIndex].focusMinutes + minutes,
        };
        return newData;
      } else {
        return [...prevData, { date: today, completedTasks: 0, focusMinutes: minutes }];
      }
    });
  }, []);

  const contextValue = {
    tasks,
    reminders,
    productivityData,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addReminder,
    updateReminder,
    deleteReminder,
    snoozeReminder,
    dismissReminder,
    addFocusMinutes,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen pb-20 overflow-hidden relative"> {/* Added pb-20 to account for navbar height */}
        <div className="container mx-auto p-4 pt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/focus" element={<FocusMode />} />
            <Route path="/motivation" element={<Motivation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Navbar activeTab={activeTab} />
        <AlarmNotifier
          reminders={reminders}
          tasks={tasks}
          onSnooze={snoozeReminder}
          onDismiss={dismissReminder}
        />
      </div>
    </AppContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
