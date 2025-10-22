
import React, { useEffect, useRef } from 'react';
import { Reminder, Task } from '../types';
import { AUDIO_FILES } from '../constants';
import Button from './Button';
import Modal from './Modal';

interface AlarmNotifierProps {
  reminders: Reminder[];
  tasks: Task[];
  onSnooze: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
}

const AlarmNotifier: React.FC<AlarmNotifierProps> = ({ reminders, tasks, onSnooze, onDismiss }) => {
  const [activeReminder, setActiveReminder] = React.useState<Reminder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(AUDIO_FILES.ALARM);
    audioRef.current.loop = true; // Loop the alarm sound

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay(); // 0 for Sunday, 6 for Saturday

      const dueReminders = reminders.filter((r) => {
        if (!r.enabled) return false;

        // Prevent repeated triggers for reminders that should not repeat or have already been triggered recently
        if (r.triggeredAt) {
          const lastTriggerDate = new Date(r.triggeredAt);
          // If already triggered today, don't trigger again unless it's a daily/custom repeating reminder and a new day
          if (lastTriggerDate.toDateString() === now.toDateString() && r.repeat === 'none') {
            return false;
          }
        }

        const [reminderHour, reminderMinute] = r.time.split(':').map(Number);
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);

        // Check if current time is equal or slightly past the reminder time (within a minute tolerance)
        const isTimeMatch =
          currentHour === reminderHour &&
          currentMinute === reminderMinute;

        if (!isTimeMatch) return false;

        if (r.repeat === 'daily') {
          return true;
        }

        if (r.repeat === 'custom' && r.days && r.days[currentDay]) {
          return true;
        }

        // For 'none' repeat, only trigger once
        return r.repeat === 'none' && !r.triggeredAt;
      });

      if (dueReminders.length > 0 && !activeReminder) {
        // Only show one reminder at a time to avoid overlap
        setActiveReminder(dueReminders[0]);
        // Play sound and vibrate
        if (dueReminders[0].sound && audioRef.current) {
          audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
        if (dueReminders[0].vibration && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    };

    const intervalId = setInterval(checkReminders, 60 * 1000); // Check every minute

    return () => {
      clearInterval(intervalId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [reminders, activeReminder]);

  const handleDismiss = () => {
    if (activeReminder) {
      onDismiss(activeReminder.id);
      setActiveReminder(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (navigator.vibrate) navigator.vibrate(0); // Stop vibration
    }
  };

  const handleSnooze = () => {
    if (activeReminder) {
      onSnooze(activeReminder.id);
      setActiveReminder(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (navigator.vibrate) navigator.vibrate(0); // Stop vibration
    }
  };

  const relatedTask = activeReminder ? tasks.find(t => t.id === activeReminder.taskId) : null;

  return (
    <Modal isOpen={!!activeReminder} onClose={handleDismiss} title="Reminder!">
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-xl font-semibold mb-2">
          {relatedTask ? relatedTask.name : 'Unknown Task'}
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          It's {activeReminder?.time}! Time to focus.
        </p>
        <div className="flex gap-4">
          {activeReminder?.snooze && (
            <Button variant="secondary" onClick={handleSnooze}>
              Snooze (5 min)
            </Button>
          )}
          <Button variant="primary" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlarmNotifier;
