<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import BaseTooltip from "../components/BaseTooltip.vue";
import UserMenu from "../components/UserMenu.vue";

const router = useRouter();
const authStore = useAuthStore();

const navigateToLogin = () => {
    router.push("/login");
};

const navigateToRegister = () => {
    router.push("/register");
};
</script>

<template>
    <header
        class="fixed top-0 left-0 right-0 z-40 px-2 sm:px-6 py-2 sm:py-2 bg-emerald-600/20 backdrop-blur-sm border-b border-indigo-200">
        <div class="max-w-4xl mx-auto flex flex-wrap gap-2 sm:gap-4 items-center justify-between">
            <div class="flex items-center gap-2 sm:gap-6">
                <div class="flex items-center gap-2">
                    <!-- Smaller logo on mobile -->
                    <img class="w-8 h-8 sm:w-10 sm:h-10" src="../assets/check.png" alt="logo">
                    <!-- Hide text on very small screens -->
                    <h1 class="hidden xs:inline-block text-sm sm:text-xl font-bold text-gray-900">Task Manager</h1>
                </div>
                <!-- Hide tagline on mobile -->
                <h2 class="hidden sm:block text-gray-800 mt-1">Stay Organized and Productive</h2>
            </div>

            <div class="flex items-center gap-1 sm:gap-4">
                <template v-if="authStore.isAuthenticated">
                    <BaseTooltip text="My Profile">
                        <UserMenu />
                    </BaseTooltip>
                </template>

                <template v-else>
                    <button @click="navigateToLogin"
                        class="btn-primary text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">Sign In</button>
                    <button @click="navigateToRegister"
                        class="btn-secondary text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2">Sign Up</button>
                </template>
            </div>
        </div>
    </header>
</template>