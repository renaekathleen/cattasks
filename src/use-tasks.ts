import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask as deleteGoogleTask,
  getDefaultTaskListId,
  type GoogleTask,
} from './google-tasks';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

function toTask(g: GoogleTask): Task {
  return { id: g.id, text: g.title, completed: g.status === 'completed' };
}

function useLocalTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('cattasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cattasks', JSON.stringify(tasks));
  }, [tasks]);

  const add = useCallback((text: string) => {
    setTasks((prev) => [...prev, { id: String(Date.now()), text, completed: false }]);
  }, []);

  const toggle = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading: false, add, toggle, remove };
}

function useGoogleTasks(accessToken: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listId, setListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await getDefaultTaskListId(accessToken);
        if (cancelled) return;
        setListId(id);
        const items = await fetchTasks(accessToken, id);
        if (cancelled) return;
        setTasks(items.map(toTask));
      } catch (err) {
        console.error('Failed to load Google Tasks:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [accessToken]);

  const add = useCallback(async (text: string) => {
    if (!listId) return;
    const created = await createTask(accessToken, listId, text);
    setTasks((prev) => [...prev, toTask(created)]);
  }, [accessToken, listId]);

  const toggle = useCallback(async (id: string) => {
    if (!listId) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = await updateTaskStatus(accessToken, listId, id, !task.completed);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? toTask(updated) : t))
    );
  }, [accessToken, listId, tasks]);

  const remove = useCallback(async (id: string) => {
    if (!listId) return;
    await deleteGoogleTask(accessToken, listId, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [accessToken, listId]);

  return { tasks, loading, add, toggle, remove };
}

export function useTasks() {
  const { accessToken, isSignedIn } = useAuth();
  const local = useLocalTasks();
  const google = useGoogleTasks(accessToken ?? '');

  if (isSignedIn && accessToken) {
    return google;
  }
  return local;
}
