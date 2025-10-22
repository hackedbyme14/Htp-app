
import { MotivationalQuote } from './types';

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston S. Churchill" },
  { quote: "The mind is everything. What you think you become.", author: "Buddha" },
  { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
];

export const TASK_CATEGORIES: string[] = [
  'Work',
  'Study',
  'Personal',
  'Health',
  'Groceries',
  'Finance',
  'Other',
];

export const PRIORITY_LEVELS: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

export const POMODORO_DURATIONS = {
  WORK: 25, // minutes
  SHORT_BREAK: 5, // minutes
  LONG_BREAK: 15, // minutes
};

export const AUDIO_FILES = {
  ALARM: '/sounds/alarm.mp3', // Placeholder, user would need to provide this
  FOCUS_MUSIC: '/sounds/focus-music.mp3', // Placeholder
};
