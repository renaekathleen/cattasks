import { useState, useEffect, useRef, type FormEvent, type Dispatch, type SetStateAction } from 'react';
import { playPurr } from './purr';
import './App.css';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

interface CatCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  taskText: string;
}

function CatCheckbox({ checked, onToggle, taskText }: CatCheckboxProps) {
  const [purring, setPurring] = useState(false);

  const handleClick = () => {
    if (!checked) {
      playPurr();
      setPurring(true);
      setTimeout(() => setPurring(false), 1500);
    }
    onToggle();
  };

  return (
    <button
      className={`cat-checkbox ${checked ? 'checked' : ''} ${purring ? 'purring' : ''}`}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      aria-label={`${checked ? 'Completed' : 'Not completed'}: ${taskText}`}
      type="button"
    >
      <span className="cat-face" aria-hidden="true">
        {checked ? (
          <svg viewBox="0 0 64 64" width="36" height="36" focusable="false">
            <path d="M10,22 Q2,6 6,4 Q10,2 20,12 C24,10 28,9 32,9 C36,9 40,10 44,12 Q54,2 58,4 Q62,6 54,22 C57,26 58,30 58,34 C58,48 46,58 32,58 C18,58 6,48 6,34 C6,30 7,26 10,22 Z" fill="var(--cat-color)" />
            <path d="M12,20 Q6,8 10,6 Q13,5 20,13 Z" fill="var(--cat-ear-inner)" />
            <path d="M52,20 Q58,8 54,6 Q51,5 44,13 Z" fill="var(--cat-ear-inner)" />
            <path d="M18,30 Q22,26 26,30" stroke="var(--cat-features)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M38,30 Q42,26 46,30" stroke="var(--cat-features)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M28,36 L32,41 L36,36 Z" fill="var(--cat-nose)" />
            <path d="M26,41 Q32,47 38,41" stroke="var(--cat-features)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="2" y1="34" x2="16" y2="36" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="2" y1="40" x2="16" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="36" x2="62" y2="34" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="40" x2="62" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" width="36" height="36" focusable="false">
            <path d="M10,22 Q2,6 6,4 Q10,2 20,12 C24,10 28,9 32,9 C36,9 40,10 44,12 Q54,2 58,4 Q62,6 54,22 C57,26 58,30 58,34 C58,48 46,58 32,58 C18,58 6,48 6,34 C6,30 7,26 10,22 Z" fill="var(--cat-color)" />
            <path d="M12,20 Q6,8 10,6 Q13,5 20,13 Z" fill="var(--cat-ear-inner)" />
            <path d="M52,20 Q58,8 54,6 Q51,5 44,13 Z" fill="var(--cat-ear-inner)" />
            <ellipse cx="22" cy="30" rx="5" ry="5.5" fill="white" />
            <ellipse cx="42" cy="30" rx="5" ry="5.5" fill="white" />
            <ellipse cx="22" cy="30" rx="3" ry="4" fill="var(--cat-features)" />
            <ellipse cx="42" cy="30" rx="3" ry="4" fill="var(--cat-features)" />
            <ellipse cx="22" cy="29" rx="1" ry="1.2" fill="white" />
            <ellipse cx="42" cy="29" rx="1" ry="1.2" fill="white" />
            <path d="M28,36 L32,41 L36,36 Z" fill="var(--cat-nose)" />
            <path d="M28,42 Q32,44 36,42" stroke="var(--cat-features)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="2" y1="34" x2="16" y2="36" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="2" y1="40" x2="16" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="36" x2="62" y2="34" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="40" x2="62" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
          </svg>
        )}
      </span>
      {purring && <span className="purr-text" aria-hidden="true">purrr~</span>}
    </button>
  );
}

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('cattasks', []);
  const [newTask, setNewTask] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const announce = (message: string) => {
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(message));
  };

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false },
    ]);
    setNewTask('');
    inputRef.current?.focus();
    announce(`Task added: ${text}`);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const toggled = { ...t, completed: !t.completed };
        announce(toggled.completed ? `Completed: ${t.text}` : `Uncompleted: ${t.text}`);
        return toggled;
      })
    );
  };

  const deleteTask = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (task) announce(`Deleted: ${task.text}`);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span aria-hidden="true">🐱</span> Cat Tasks
        </h1>
      </header>

      <form className="add-form" onSubmit={addTask} role="search">
        <label htmlFor="new-task" className="sr-only">New task</label>
        <input
          id="new-task"
          ref={inputRef}
          type="text"
          className="task-input"
          placeholder="What do you need to do?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          autoFocus
        />
        <button type="submit" className="add-btn">
          + Add
        </button>
      </form>

      {tasks.length > 0 && (
        <div className="stats" aria-live="polite" aria-atomic="true">
          <span>{pendingCount} pending</span>
          <span className="stats-divider" aria-hidden="true">|</span>
          <span>{completedCount} done</span>
        </div>
      )}

      <ul className="task-list" aria-label="Tasks">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <CatCheckbox
              checked={task.completed}
              onToggle={() => toggleTask(task.id)}
              taskText={task.text}
            />
            <span className="task-text">{task.text}</span>
            <button
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
              aria-label={`Delete: ${task.text}`}
              type="button"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <div className="empty-state">
          <svg className="empty-cat" viewBox="-5 -5 120 70" width="120" height="70" aria-hidden="true" focusable="false">
            <g transform="translate(2, 4) rotate(-10, 22, 26)">
              <path d="M10,32 C4,32 0,38 4,44 Q12,52 22,52 Q32,52 40,44 C44,38 40,32 34,32 Q22,28 10,32 Z" fill="#c8baa8" />
              <ellipse cx="6" cy="22" rx="5" ry="7" transform="rotate(-20, 6, 22)" fill="#c8baa8" />
              <ellipse cx="17" cy="16" rx="5" ry="7" transform="rotate(-5, 17, 16)" fill="#c8baa8" />
              <ellipse cx="28" cy="17" rx="5" ry="7" transform="rotate(5, 28, 17)" fill="#c8baa8" />
              <ellipse cx="38" cy="23" rx="5" ry="7" transform="rotate(20, 38, 23)" fill="#c8baa8" />
            </g>
            <g transform="translate(58, 0) rotate(10, 22, 26)">
              <path d="M10,32 C4,32 0,38 4,44 Q12,52 22,52 Q32,52 40,44 C44,38 40,32 34,32 Q22,28 10,32 Z" fill="#c8baa8" />
              <ellipse cx="6" cy="22" rx="5" ry="7" transform="rotate(-20, 6, 22)" fill="#c8baa8" />
              <ellipse cx="17" cy="16" rx="5" ry="7" transform="rotate(-5, 17, 16)" fill="#c8baa8" />
              <ellipse cx="28" cy="17" rx="5" ry="7" transform="rotate(5, 28, 17)" fill="#c8baa8" />
              <ellipse cx="38" cy="23" rx="5" ry="7" transform="rotate(20, 38, 23)" fill="#c8baa8" />
            </g>
          </svg>
          <p>No tasks yet. Add one above!</p>
        </div>
      )}

      <div aria-live="assertive" className="sr-only" role="status">
        {announcement}
      </div>
    </div>
  );
}

export default App;
