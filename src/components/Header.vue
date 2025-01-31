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
    <div class="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
                <img width="42" height="42" src="../assets/check.png" alt="logo">
                <h1 class="text-xl font-bold text-gray-900">Task Manager</h1>
            </div>
            <h2 class="text-gray-600 mt-1">Stay Organized and Productive</h2>
        </div>

        <div class="flex items-center gap-4">
            <template v-if="authStore.isAuthenticated">
                <BaseTooltip text="My Profile">
                    <UserMenu />
                </BaseTooltip>
            </template>

            <template v-else>
                <button @click="navigateToLogin" class="btn-primary">Sign In</button>
                <button @click="navigateToRegister" class="btn-secondary">Sign Up</button>
            </template>
        </div>
    </div>
</template>