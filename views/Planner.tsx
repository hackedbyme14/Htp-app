
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import CalendarView from '../components/CalendarView';
import ReminderForm from '../components/ReminderForm';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Task, Reminder } from '../types';

const Planner: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Planner must be used within an AppContext.Provider');
  }
  const { tasks, reminders, addTask, updateTask, deleteTask, toggleTaskComplete, addReminder, updateReminder, deleteReminder } = context;

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [currentReminderTaskId, setCurrentReminderTaskId] = useState<string>('');
  const [currentReminderTaskName, setCurrentReminderTaskName] = useState<string>('');


  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      updateTask(taskData as Omit<Task, 'createdAt' | 'completed'>);
    } else {
      addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'completed'>);
    }
    closeTaskModal();
  };

  const openRemindersModal = (taskId: string, taskName: string, reminder?: Reminder) => {
    setCurrentReminderTaskId(taskId);
    setCurrentReminderTaskName(taskName);
    setEditingReminder(reminder || null);
    setIsReminderModalOpen(true);
  };

  const closeRemindersModal = () => {
    setIsReminderModalOpen(false);
    setEditingReminder(null);
    setCurrentReminderTaskId('');
    setCurrentReminderTaskName('');
  };

  const handleReminderSubmit = (reminderData: Omit<Reminder, 'id' | 'triggeredAt'> & { id?: string }) => {
    if (reminderData.id) {
      updateReminder(reminderData as Omit<Reminder, 'triggeredAt'>);
    } else {
      addReminder(reminderData as Omit<Reminder, 'id'>);
    }
    closeRemindersModal();
  };

  const remindersForCurrentTask = useMemo(() => {
    return reminders.filter(r => r.taskId === currentReminderTaskId);
  }, [reminders, currentReminderTaskId]);

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-6">Your Planner</h1>

      <Button onClick={openNewTaskModal} className="w-full mb-6 py-3 text-lg">
        Add New Task
      </Button>

      {/* Calendar View */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Calendar Overview</h2>
        <CalendarView tasks={tasks} onSelectTask={openEditTaskModal} />
      </section>

      {/* Task List Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">My Tasks</h2>
        <TaskList
          tasks={tasks}
          onToggleComplete={toggleTaskComplete}
          onEdit={openEditTaskModal}
          onDelete={deleteTask}
          onViewReminders={openRemindersModal}
        />
      </section>

      {/* Task Form Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} title={editingTask ? 'Edit Task' : 'Add New Task'}>
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={closeTaskModal}
        />
      </Modal>

      {/* Reminders Modal */}
      <Modal isOpen={isReminderModalOpen} onClose={closeRemindersModal} title={`Reminders for "${currentReminderTaskName}"`}>
        <div className="space-y-4">
          <Button onClick={() => openRemindersModal(currentReminderTaskId, currentReminderTaskName)} className="w-full">
            Add New Reminder
          </Button>

          {remindersForCurrentTask.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No reminders set for this task.</p>
          ) : (
            <ul className="space-y-2">
              {remindersForCurrentTask.map(reminder => (
                <li key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                  <div>
                    <span className={`font-semibold ${reminder.enabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 line-through dark:text-gray-400'}`}>
                      {reminder.time}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      ({reminder.repeat === 'custom' && reminder.days ? reminder.days.map((d, i) => d ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i] : '').join('') : reminder.repeat})
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => openRemindersModal(currentReminderTaskId, currentReminderTaskName, reminder)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteReminder(reminder.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {editingReminder !== null ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">{editingReminder.id ? 'Edit Reminder' : 'Add Reminder'}</h3>
              <ReminderForm
                reminder={editingReminder}
                taskId={currentReminderTaskId}
                onSubmit={handleReminderSubmit}
                onCancel={() => setEditingReminder(null)}
              />
            </div>
          ) : (
            // If editingReminder is null, show a button to add new reminder
            <div className="mt-4">
              <Button onClick={() => openRemindersModal(currentReminderTaskId, currentReminderTaskName)} className="w-full">
                Add New Reminder
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Planner;
