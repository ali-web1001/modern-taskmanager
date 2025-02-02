import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from "vue-router";
import { useAuthStore } from "../stores/auth";
import TaskManager from "../views/TaskManager.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
// import Profile from "../views/Profile.vue";
import { nextTick } from "vue";
import AuthCallback from "../views/AuthCallback.vue";

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "tasks",
      component: TaskManager,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresGuest: true }, // Add this meta field
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: { requiresGuest: true }, // Add this meta field
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Profile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/auth/callback",
      name: "auth-callback",
      component: AuthCallback, // Remove the function wrapper
    },
    // Add a catch-all route for Netlify
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

// Navigation guard with improved auth handling
router.beforeEach(
  async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next) => {
    const authStore = useAuthStore();

    // Wait for initial auth check if necessary
    if (authStore.loading) {
      await authStore.checkAuth();
      await nextTick();
    }

    // Get the authentication status
    const isAuthenticated = authStore.isAuthenticated;

    // Handle routes requiring authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: "login", query: { redirect: to.fullPath } });
      return;
    }

    // Handle routes requiring guest access (login/register)
    if (to.meta.requiresGuest && isAuthenticated) {
      next({ name: "tasks" });
      return;
    }

    next();
  }
);

export default router;
