const API_BASE = '/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  auth: {
    login: (username: string, password: string) =>
      api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    register: (username: string, email: string, password: string, displayName: string) =>
      api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, displayName }),
      }),
    github: (data: any) =>
      api.request('/auth/github', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  users: {
    getMe: () => api.request('/users/me'),
    getById: (id: string) => api.request(`/users/${id}`),
    updateMe: (data: any) => api.request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    search: (q: string) => api.request(`/users/search?q=${encodeURIComponent(q)}`),
  },

  activities: {
    create: (data: any) => api.request('/activities', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/activities?${query}`);
    },
    getById: (id: string) => api.request(`/activities/${id}`),
    delete: (id: string) => api.request(`/activities/${id}`, { method: 'DELETE' }),
    getFeed: () => api.request('/activities/feed'),
  },

  social: {
    follow: (id: string) => api.request(`/social/follow/${id}`, { method: 'POST' }),
    unfollow: (id: string) => api.request(`/social/follow/${id}`, { method: 'DELETE' }),
    getFollowers: (id: string) => api.request(`/social/followers/${id}`),
    getFollowing: (id: string) => api.request(`/social/following/${id}`),
    like: (activityId: string) => api.request(`/social/like/${activityId}`, { method: 'POST' }),
    unlike: (activityId: string) => api.request(`/social/like/${activityId}`, { method: 'DELETE' }),
    comment: (activityId: string, content: string) =>
      api.request(`/social/comment/${activityId}`, { method: 'POST', body: JSON.stringify({ content }) }),
    getComments: (activityId: string) => api.request(`/social/comments/${activityId}`),
  },

  achievements: {
    getAll: () => api.request('/achievements'),
    getByUser: (userId: string) => api.request(`/achievements/${userId}`),
  },

  notifications: {
    getAll: () => api.request('/notifications'),
    markRead: (id: string) => api.request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => api.request('/notifications/read-all', { method: 'PUT' }),
    getUnreadCount: () => api.request('/notifications/unread-count'),
  },

  settings: {
    get: () => api.request('/settings'),
    update: (data: any) => api.request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  stats: {
    getDashboard: () => api.request('/stats/dashboard'),
    getTrends: (period: string) => api.request(`/stats/trends?period=${period}`),
  },
};
