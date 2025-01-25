import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import TaskManager from '../views/TaskManager.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'tasks',
      component: TaskManager
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    }
  ]
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Wait for initial auth check
  if (authStore.loading) {
    await authStore.checkAuth();
  }

  next();
});

export default router;