<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (authStore.loading) {
    await authStore.checkAuth();
  }
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>