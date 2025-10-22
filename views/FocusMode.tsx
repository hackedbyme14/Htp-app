
import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import Button from '../components/Button';
import { POMODORO_DURATIONS, MOTIVATIONAL_QUOTES, AUDIO_FILES } from '../constants';
import { AppContext } from '../App';

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

const FocusMode: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('FocusMode must be used within an AppContext.Provider');
  }
  const { addFocusMinutes } = context;

  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATIONS.WORK * 60);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0); // Completed work sessions
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [currentAuthor, setCurrentAuthor] = useState<string>('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_FILES.FOCUS_MUSIC);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Lower volume for background music

    notificationSoundRef.current = new Audio(AUDIO_FILES.ALARM);
    notificationSoundRef.current.volume = 0.5;

    // Set initial quote
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentQuote(MOTIVATIONAL_QUOTES[randomIndex].quote);
    setCurrentAuthor(MOTIVATIONAL_QUOTES[randomIndex].author);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current!);
      handleTimerComplete();
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive, timeLeft]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleTimerComplete = useCallback(() => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(e => console.error("Error playing notification sound:", e));
    }

    if (phase === 'work') {
      addFocusMinutes(POMODORO_DURATIONS.WORK); // Record completed work minutes
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      if (newPomodoroCount % 4 === 0) {
        setPhase('longBreak');
        setTimeLeft(POMODORO_DURATIONS.LONG_BREAK * 60);
      } else {
        setPhase('shortBreak');
        setTimeLeft(POMODORO_DURATIONS.SHORT_BREAK * 60);
      }
    } else {
      // After a break, always go back to work
      setPhase('work');
      setTimeLeft(POMODORO_DURATIONS.WORK * 60);
    }
    setIsActive(false); // Pause after phase completion, user can manually start next
    loadRandomQuote();
  }, [phase, pomodoroCount, addFocusMinutes]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
    if (isMusicPlaying && audioRef.current) {
        if (!isActive) { // If timer is about to start/resume
            audioRef.current.play().catch(e => console.error("Error playing music:", e));
        } else { // If timer is about to pause
            audioRef.current.pause();
        }
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current!);
    setIsActive(false);
    setPhase('work');
    setTimeLeft(POMODORO_DURATIONS.WORK * 60);
    setPomodoroCount(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsMusicPlaying(false);
    loadRandomQuote();
  };

  const skipPhase = () => {
    clearInterval(timerRef.current!);
    if (phase === 'work') {
      addFocusMinutes(POMODORO_DURATIONS.WORK - Math.floor(timeLeft / 60)); // Add remaining time of work if skipped early
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      if (newPomodoroCount % 4 === 0) {
        setPhase('longBreak');
        setTimeLeft(POMODORO_DURATIONS.LONG_BREAK * 60);
      } else {
        setPhase('shortBreak');
        setTimeLeft(POMODORO_DURATIONS.SHORT_BREAK * 60);
      }
    } else {
      setPhase('work');
      setTimeLeft(POMODORO_DURATIONS.WORK * 60);
    }
    setIsActive(false);
    loadRandomQuote();
  };

  const loadRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentQuote(MOTIVATIONAL_QUOTES[randomIndex].quote);
    setCurrentAuthor(MOTIVATIONAL_QUOTES[randomIndex].author);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing music:", e));
      }
      setIsMusicPlaying((prev) => !prev);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const phaseColors = {
    work: 'bg-red-500 dark:bg-red-700',
    shortBreak: 'bg-green-500 dark:bg-green-700',
    longBreak: 'bg-blue-500 dark:bg-blue-700',
  };

  const phaseTitles = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  return (
    <div className="p-4 space-y-8 text-center flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Focus Mode (Pomodoro)</h1>

      {/* Timer Display */}
      <div
        className={`w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-500 ease-in-out
                    ${phaseColors[phase]} text-white transform hover:scale-105`}
      >
        <h2 className="text-2xl font-semibold mb-2">{phaseTitles[phase]}</h2>
        <p className="text-7xl font-extrabold">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </p>
        <p className="text-sm mt-1">{pomodoroCount} Pomodoros Completed</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-8">
        <Button onClick={toggleTimer} variant="primary" size="lg">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="secondary" size="lg">
          Reset
        </Button>
        <Button onClick={skipPhase} variant="ghost" size="lg">
          Skip
        </Button>
      </div>

      {/* Background Music */}
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={toggleMusic} variant="secondary" size="md">
          {isMusicPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          )}
        </Button>
        <span className="text-gray-700 dark:text-gray-300">Background Music ({isMusicPlaying ? 'On' : 'Off'})</span>
      </div>

      {/* Motivational Quote */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8 w-full max-w-md">
        <p className="text-xl italic text-gray-800 dark:text-gray-200 mb-2">"{currentQuote}"</p>
        <p className="text-md text-right font-light text-gray-600 dark:text-gray-400">- {currentAuthor}</p>
      </div>
    </div>
  );
};

export default FocusMode;
