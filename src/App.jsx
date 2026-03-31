import { useState, useEffect, useRef } from 'react';
import { playPurr } from './purr';
import './App.css';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
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

function CatCheckbox({ checked, onToggle, taskText }) {
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
            <polygon points="8,22 2,2 22,14" fill="var(--cat-color)" />
            <polygon points="56,22 62,2 42,14" fill="var(--cat-color)" />
            <polygon points="10,20 6,6 20,15" fill="var(--cat-ear-inner)" />
            <polygon points="54,20 58,6 44,15" fill="var(--cat-ear-inner)" />
            <ellipse cx="32" cy="34" rx="26" ry="24" fill="var(--cat-color)" />
            <path d="M18,30 Q22,26 26,30" stroke="var(--cat-features)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M38,30 Q42,26 46,30" stroke="var(--cat-features)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M30,37 L32,39 L34,37 Z" fill="var(--cat-nose)" />
            <path d="M26,41 Q32,47 38,41" stroke="var(--cat-features)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <line x1="2" y1="34" x2="16" y2="36" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="2" y1="40" x2="16" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="36" x2="62" y2="34" stroke="var(--cat-features)" strokeWidth="1" />
            <line x1="48" y1="40" x2="62" y2="40" stroke="var(--cat-features)" strokeWidth="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" width="36" height="36" focusable="false">
            <polygon points="8,22 2,2 22,14" fill="var(--cat-color)" />
            <polygon points="56,22 62,2 42,14" fill="var(--cat-color)" />
            <polygon points="10,20 6,6 20,15" fill="var(--cat-ear-inner)" />
            <polygon points="54,20 58,6 44,15" fill="var(--cat-ear-inner)" />
            <ellipse cx="32" cy="34" rx="26" ry="24" fill="var(--cat-color)" />
            <ellipse cx="22" cy="30" rx="5" ry="5.5" fill="white" />
            <ellipse cx="42" cy="30" rx="5" ry="5.5" fill="white" />
            <ellipse cx="22" cy="30" rx="3" ry="4" fill="var(--cat-features)" />
            <ellipse cx="42" cy="30" rx="3" ry="4" fill="var(--cat-features)" />
            <ellipse cx="22" cy="29" rx="1" ry="1.2" fill="white" />
            <ellipse cx="42" cy="29" rx="1" ry="1.2" fill="white" />
            <path d="M30,37 L32,39 L34,37 Z" fill="var(--cat-nose)" />
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
  const [tasks, setTasks] = useLocalStorage('cattasks', []);
  const [newTask, setNewTask] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef(null);

  const announce = (message) => {
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(message));
  };

  const addTask = (e) => {
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

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const toggled = { ...t, completed: !t.completed };
        announce(toggled.completed ? `Completed: ${t.text}` : `Uncompleted: ${t.text}`);
        return toggled;
      })
    );
  };

  const deleteTask = (id) => {
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
          placeholder="What needs doing, human?"
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
          <svg className="empty-cat" viewBox="0 0 90 45" width="90" height="45" aria-hidden="true" focusable="false">
            <g transform="translate(5, 8) rotate(-12, 15, 18)">
              <ellipse cx="15" cy="22" rx="10" ry="8" fill="#c8baa8" />
              <ellipse cx="5" cy="12" rx="4" ry="5" fill="#c8baa8" />
              <ellipse cx="14" cy="8" rx="4" ry="5" fill="#c8baa8" />
              <ellipse cx="23" cy="11" rx="4" ry="5" fill="#c8baa8" />
            </g>
            <g transform="translate(50, 5) rotate(12, 15, 18)">
              <ellipse cx="15" cy="22" rx="10" ry="8" fill="#c8baa8" />
              <ellipse cx="5" cy="12" rx="4" ry="5" fill="#c8baa8" />
              <ellipse cx="14" cy="8" rx="4" ry="5" fill="#c8baa8" />
              <ellipse cx="23" cy="11" rx="4" ry="5" fill="#c8baa8" />
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
