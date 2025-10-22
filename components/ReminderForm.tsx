
import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import Button from './Button';

interface ReminderFormProps {
  reminder?: Reminder | null;
  taskId: string;
  onSubmit: (reminder: Omit<Reminder, 'id' | 'triggeredAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ReminderForm: React.FC<ReminderFormProps> = ({ reminder, taskId, onSubmit, onCancel }) => {
  const [time, setTime] = useState(reminder?.time || '09:00');
  const [sound, setSound] = useState(reminder?.sound ?? true);
  const [vibration, setVibration] = useState(reminder?.vibration ?? true);
  const [snooze, setSnooze] = useState(reminder?.snooze ?? true);
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'custom'>(reminder?.repeat || 'none');
  const [customDays, setCustomDays] = useState<boolean[]>(reminder?.days || new Array(7).fill(false));
  const [enabled, setEnabled] = useState(reminder?.enabled ?? true);

  useEffect(() => {
    if (reminder) {
      setTime(reminder.time);
      setSound(reminder.sound);
      setVibration(reminder.vibration);
      setSnooze(reminder.snooze);
      setRepeat(reminder.repeat);
      setCustomDays(reminder.days || new Array(7).fill(false));
      setEnabled(reminder.enabled);
    } else {
      setTime('09:00');
      setSound(true);
      setVibration(true);
      setSnooze(true);
      setRepeat('none');
      setCustomDays(new Array(7).fill(false));
      setEnabled(true);
    }
  }, [reminder]);

  const handleDayToggle = (index: number) => {
    setCustomDays((prev) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index];
      return newDays;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReminder: Omit<Reminder, 'id' | 'triggeredAt'> & { id?: string } = {
      id: reminder?.id,
      taskId,
      time,
      sound,
      vibration,
      snooze,
      repeat,
      days: repeat === 'custom' ? customDays : undefined,
      enabled,
    };
    onSubmit(newReminder);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Time
        </label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="sound"
          checked={sound}
          onChange={(e) => setSound(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="sound" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
          Sound
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="vibration"
          checked={vibration}
          onChange={(e) => setVibration(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="vibration" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
          Vibration
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="snooze"
          checked={snooze}
          onChange={(e) => setSnooze(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="snooze" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
          Snooze
        </label>
      </div>

      <div>
        <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Repeat
        </label>
        <select
          id="repeat"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value as 'none' | 'daily' | 'custom')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5"
        >
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {repeat === 'custom' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Days
          </label>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(index)}
                className={`py-2 px-1 rounded-md text-sm font-medium
                  ${customDays[index]
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
        />
        <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
          Enabled
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {reminder ? 'Update Reminder' : 'Add Reminder'}
        </Button>
      </div>
    </form>
  );
};

export default ReminderForm;
