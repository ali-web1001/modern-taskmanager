import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

export const taskApi = {
  getTasks: () => api.get('/tasks'),
  createTask: (task: any) => api.post('/tasks', task),
  updateTask: (id: string, task: any) => api.patch(`/tasks/${id}`, task),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`)
};

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

export default api;