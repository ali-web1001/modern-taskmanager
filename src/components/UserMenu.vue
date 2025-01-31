<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";

const router = useRouter();
const authStore = useAuthStore();
const showMenu = ref(false);
const toast =  useToast();

const navigateToProfile = () => {
  router.push("/profile");
  showMenu.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/login");
    toast.info('Logout Successfully!')
  } catch (error) {
    console.error("Logout error:", error);
    router.push("/login");
  }
};

const closeMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    showMenu.value = false;
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("click", closeMenu);
}
</script>

<template>
  <div class="relative inline-block user-menu">
    <button
      class="flex items-center space-x-2 focus:outline-none"
      @click.stop="showMenu = !showMenu"
    >
      <div
        class="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center"
      >
        <img
          v-if="authStore.user?.user_metadata?.avatar_url"
          :src="authStore.user.user_metadata.avatar_url"
          :alt="authStore.user.user_metadata.name"
          class="w-10 h-10 rounded-full"
        />

        <UserCircleIcon v-else class="w-6 h-6 text-indigo-500" />
      </div>

      <span class="text-gray-700">
        {{ authStore.user?.user_metadata?.name || authStore.user?.email }}
      </span>
    </button>

    <div
      v-if="showMenu"
      class="absolute left-0 origin-top-right mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <button
          @click="navigateToProfile"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Cog6ToothIcon class="w-5 h-5 mr-2" />
          Profile Settings
        </button>
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>
