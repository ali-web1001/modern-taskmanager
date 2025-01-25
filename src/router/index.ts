import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
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
      component: TaskManager,
      meta: { requiresAuth: true } // Add authentication meta field
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

// Navigation guard with proper parameter usage
router.beforeEach(async (
  to: RouteLocationNormalized, 
  _from: RouteLocationNormalized, 
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  // Wait for initial auth check
  if (authStore.loading) {
    await authStore.checkAuth();
  }
  
 // Check if the route requires authentication
 const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
 if (requiresAuth && !authStore.isAuthenticated) {
   // Redirect to login if not authenticated
   next('/login');
 } else {
   next();
 }
});

export default router;