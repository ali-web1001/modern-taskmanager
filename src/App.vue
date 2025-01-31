<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { onMounted, watch } from 'vue';
import LoadingComponent from './components/LoadingComponent.vue';

const authStore = useAuthStore();
const router = useRouter();

// Watch for authentication state changes to handle navigation
watch(() => authStore.isAuthenticated, (isAuthenticated, oldValue) => {
  // Only react to actual changes in auth state, not initial setup
  if (oldValue !== undefined) {
    const currentRoute = router.currentRoute.value;
    
    if (!isAuthenticated && currentRoute.meta.requiresAuth) {
      // If user becomes unauthenticated while on a protected route
      router.replace({ 
        name: 'login',
        query: { redirect: currentRoute.fullPath }
      });
    } else if (isAuthenticated && currentRoute.meta.requiresGuest) {
      // If user becomes authenticated while on a guest-only route
      const redirectPath = currentRoute.query.redirect as string || '/';
      router.replace(redirectPath);
    }
  }
});

onMounted(async () => {
  // Initial auth check on app mount
  if (authStore.loading) {
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('Auth check failed:', error);
      // Handle failed auth check - probably redirect to login
      if (router.currentRoute.value.meta.requiresAuth) {
        router.replace('/login');
      }
    }
  }
});
</script>

<template>
  <div class="app-container">
    <!-- Show loading component during initial auth check -->
    <LoadingComponent v-if="authStore.loading" />
    
    <!-- Main content with transition -->
    <router-view v-else v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>