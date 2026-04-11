/**
 * API client - base URL and fetch helpers for backend
 * Uses relative /api in dev (Vite proxy) or VITE_API_URL in production
 */
const BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

export async function request(endpoint, options = {}) {
  const url = BASE + endpoint;
  const headers = { ...options.headers };
  if (!options.body || typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  const res = await fetch(url, { ...options, headers });
  
  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  } else {
    data = { error: await res.text().catch(() => 'Unknown error') };
  }

  if (!res.ok) {
    console.error(`[API Error] ${res.status}:`, data);
    throw { status: res.status, ...data };
  }
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  users: {
    getAll: () => request('/api/users'),
    search: (query) => request(`/api/users/search?q=${encodeURIComponent(query)}`),
    getMe: () => request('/api/users/me'),
    getById: (id) => request(`/api/users/${id}`),
    updateMe: (body) => request('/api/users/me', { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
    getActivity: (id) => request(`/api/users/${id}/activity`),
  },
  posts: {
    getAll: () => request('/api/posts'),
    getById: (id) => request(`/api/posts/${id}`),
    create: (body) => request('/api/posts', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    update: (id, body) => request(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),
    getComments: (postId) => request(`/api/posts/${postId}/comments`),
    addComment: (postId, body) => request(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }), // body can include parent_id
    toggleLike: (postId) => request(`/api/posts/${postId}/like`, { method: 'POST' }),
    getLikeStatus: (postId) => request(`/api/posts/${postId}/like`),
    toggleRepost: (postId) => request(`/api/posts/${postId}/repost`, { method: 'POST' }),
    getRepostStatus: (postId) => request(`/api/posts/${postId}/repost`),
  },
  jobs: {
    getAll: () => request('/api/jobs'),
    create: (body) => request('/api/jobs', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/jobs/${id}`, { method: 'DELETE' }),
  },
  connections: {
    getSuggestions: () => request('/api/connections/suggestions'),
    getPending: () => request('/api/connections/pending'),
    getAllAccepted: () => request('/api/connections/accepted'), // Updated this
    sendRequest: (userId) => request(`/api/connections/request/${userId}`, { method: 'POST' }),
    accept: (userId) => request(`/api/connections/accept/${userId}`, { method: 'PUT' }),
    remove: (userId) => request(`/api/connections/${userId}`, { method: 'DELETE' }),
  },
  comments: {
    delete: (id) => request(`/api/comments/${id}`, { method: 'DELETE' }),
  },
  skills: {
    getByUser: (userId) => request(`/api/skills/user/${userId}`),
    add: (body) => request('/api/skills', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/skills/${id}`, { method: 'DELETE' }),
  },
  ai: {
    improvePost: (body) => request('/api/ai/improve-post', { method: 'POST', body: JSON.stringify(body) }),
  },
  applications: {
    apply: (body) => request('/api/applications', { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    getMe: () => request('/api/applications/me'),
    getJobApplicants: (jobId) => request(`/api/applications/job/${jobId}`),
    updateStatus: (id, status) => request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
};
