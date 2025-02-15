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
import AdminDashboard from "../views/AdminDashboard.vue";
import CategoryManager from "../views/CategoryManager.vue";
import LabelManager from "../views/LabelManager.vue";
import { supabase } from "../lib/supabase";

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
      path: "/admin",
      name: "admin",
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    {
      path: "/categories",
      name: "categories",
      component: CategoryManager,
      meta: { requiresAuth: true },
    },
    {
      path: "/labels",
      name: "labels",
      component: LabelManager,
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

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin", { user_id: userId });

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return data || false;
}

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

    // Check admin requirement
    if (to.meta.requiresAdmin && isAuthenticated) {
      const isUserAdmin = await isAdmin(authStore.user!.id);
      if (!isUserAdmin) {
        next({ name: "tasks" });
        return;
      }
    }

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
