const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password })
  }),
  getCredentials: () => request('/auth/credentials'),

  // Generic CRUD
  getAll: (resource) => request(`/${resource}`),
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) => request(`/${resource}`, {
    method: 'POST', body: JSON.stringify(data)
  }),
  update: (resource, id, data) => request(`/${resource}/${id}`, {
    method: 'PUT', body: JSON.stringify(data)
  }),
  delete: (resource, id) => request(`/${resource}/${id}`, {
    method: 'DELETE'
  }),

  // AI endpoints
  aiAnalyze: (endpoint) => request(`/ai/${endpoint}`, { method: 'POST' }),
  aiClearCustoms: (id) => request(`/ai/customs/${id}/ai-clear`, { method: 'POST' }),
  aiHistory: (page = 1, limit = 20) => request(`/ai/history?page=${page}&limit=${limit}`),
  voyageDemurrage: (id) => request(`/ai/voyages/${id}/demurrage`),
};
