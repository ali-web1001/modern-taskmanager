import {
  createRouter,
  createWebHistory,
  // NavigationGuardNext,
  // RouteLocationNormalized,
} from "vue-router";

import { useAuthStore } from "../stores/auth";
import TaskManager from "../views/TaskManager.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import AuthCallBack from "../views/AuthCallBack.vue";
import { nextTick } from "vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "tasks",
      component: TaskManager,
      meta: { requiresAuth: true }, // Add authentication meta field
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/auth/callback",
      name: "auth-callback",
      component: () => AuthCallBack,
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Wait for initial auth check
  if (authStore.loading) {
    await authStore.checkAuth();
  }
  // Force a reactivity update before navigating
  await nextTick();

  // Check if route requires auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

// Navigation guard with proper parameter usage
// router.beforeEach(
//   async (
//     to: RouteLocationNormalized,
//     _from: RouteLocationNormalized,
//     next: NavigationGuardNext
//   ) => {
//     const authStore = useAuthStore();
//
//     // Wait for initial auth check
//     if (authStore.loading) {
//       await authStore.checkAuth();
//     }
//
//     // Check if the route requires authentication
//     const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
//
//     if (requiresAuth && !authStore.isAuthenticated) {
//       // Redirect to login if not authenticated
//       next("/login");
//     } else {
//       next();
//     }
//   }
// );

export default router;
