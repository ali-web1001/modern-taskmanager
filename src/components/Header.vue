<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import BaseTooltip from "../components/BaseTooltip.vue";
import UserMenu from "../components/UserMenu.vue";
import { useThemeStore } from "../stores/theme";
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
import { onMounted, ref } from "vue";
import { supabase } from '../lib/supabase';

const router = useRouter();
const authStore = useAuthStore();
const isAdmin = ref(false);

const themeStore = useThemeStore()

const toggleDarkMode = () => {
    themeStore.toggleTheme()
    // Optional: Force update if needed (usually not necessary)
    // nextTick(() => updateDOM())
}

const navigateToLogin = () => {
    router.push("/login");
};

const navigateToRegister = () => {
    router.push("/register");
};

onMounted(async () => {
    if (authStore.user) {
        const { data } = await supabase.rpc('is_admin', {
            user_id: authStore.user.id
        });
        isAdmin.value = !!data;
    }
});

const navigateToAdmin = () => {
    router.push("/admin");
};
</script>

<template>
    <header
        class="fixed top-0 left-0 right-0 z-40 px-2 sm:px-6 py-2 sm:py-2 bg-indigo-700/20 dark:bg-indigo-950/90 backdrop-blur-sm border-b border-indigo-400 dark:border-indigo-600">
        <div class="max-w-4xl mx-auto flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
            <div class="flex items-center gap-2 sm:gap-6">

                <div class="flex items-center gap-2">
                    <!-- Smaller logo on mobile -->
                    <img class="w-8 h-8 sm:w-10 sm:h-10" src="../assets/check.png" alt="logo">
                    <!-- Hide text on very small screens -->
                    <h1 class="hidden xs:inline-block text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-200">
                        Task Manager</h1>
                </div>
                <!-- Hide tagline on mobile -->
                <h2 class="hidden sm:block text-gray-800 dark:text-gray-200 mt-1">Stay Organized and Productive</h2>
            </div>

            <!-- Dark mode toggle -->
            <button @click="toggleDarkMode" title="toggle color mode"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-indigo-700 transition-colors duration-200"
                aria-label="Toggle dark mode">
                <SunIcon v-if="!themeStore.isDark" class="w-5 h-5 text-gray-900 dark:text-gray-100" />
                <MoonIcon v-else class="w-5 h-5 text-gray-200 dark:text-indigo-300" />
            </button>

            <div class="flex items-center gap-1 sm:gap-4">
                <template v-if="authStore.isAuthenticated">
                    <!-- Admin Dashboard Link -->
                    <button v-if="isAdmin" @click="navigateToAdmin"
                        class="btn-secondary text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">
                        Admin
                    </button>

                    <BaseTooltip text="My Profile">
                        <UserMenu />
                    </BaseTooltip>
                </template>

                <template v-else>
                    <button @click="navigateToLogin"
                        class="btn-primary bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">Sign
                        In</button>
                    <button @click="navigateToRegister"
                        class="btn-secondary hover:bg-gray-200 dark:hover:bg-gray-200 hover:text-gray-900 dark:hover:text-gray-800 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">Sign
                        Up</button>
                </template>
            </div>
        </div>
    </header>
</template>