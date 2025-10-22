
export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  time: string; // HH:MM
  sound: boolean;
  vibration: boolean;
  snooze: boolean;
  repeat: 'none' | 'daily' | 'custom';
  days?: boolean[]; // For custom repeat: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  enabled: boolean;
  triggeredAt?: string; // Last time it was triggered (YYYY-MM-DDTHH:MM:SS)
}

export interface MotivationalQuote {
  quote: string;
  author: string;
}

export interface ProductivityData {
  date: string; // YYYY-MM-DD
  completedTasks: number;
  focusMinutes: number;
}
