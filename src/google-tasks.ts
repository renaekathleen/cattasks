const API_BASE = 'https://tasks.googleapis.com/tasks/v1';

export interface GoogleTask {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  notes?: string;
  due?: string;
  updated?: string;
}

interface TaskListResponse {
  items?: GoogleTask[];
}

interface TaskListsResponse {
  items?: { id: string; title: string }[];
}

async function request<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Tasks API error ${res.status}: ${body}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export async function getDefaultTaskListId(token: string): Promise<string> {
  const data = await request<TaskListsResponse>('/users/@me/lists', token);
  return data.items?.[0]?.id ?? '@default';
}

export async function fetchTasks(token: string, listId: string): Promise<GoogleTask[]> {
  const data = await request<TaskListResponse>(
    `/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,
    token,
  );
  return (data.items ?? []).filter((t) => t.title);
}

export async function createTask(token: string, listId: string, title: string): Promise<GoogleTask> {
  return request<GoogleTask>(`/lists/${listId}/tasks`, token, {
    method: 'POST',
    body: JSON.stringify({ title, status: 'needsAction' }),
  });
}

export async function updateTaskStatus(
  token: string,
  listId: string,
  taskId: string,
  completed: boolean,
): Promise<GoogleTask> {
  return request<GoogleTask>(`/lists/${listId}/tasks/${taskId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
      ...(!completed && { completed: null }),
    }),
  });
}

export async function deleteTask(token: string, listId: string, taskId: string): Promise<void> {
  await request<void>(`/lists/${listId}/tasks/${taskId}`, token, {
    method: 'DELETE',
  });
}
