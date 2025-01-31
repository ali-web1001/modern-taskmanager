<script setup lang="ts">
import { useRouter } from "vue-router";
// import { useAuthStore } from "../stores/auth";

const router = useRouter();
// const authStore = useAuthStore();

const navigateToLogin = () => {
    router.push("/login");
};

const navigateToRegister = () => {
    router.push("/register");
};
</script>

<template>
    <div class="text-center py-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to Task Manager
        </h2>
        <p class="text-gray-600 mb-8">
            Please sign in or create an account to manage your tasks.
        </p>
        <div class="flex justify-center gap-4">
            <button @click="navigateToLogin" class="btn-primary px-8">
                Sign In
            </button>
            <button @click="navigateToRegister" class="btn-secondary px-8">
                Sign Up
            </button>
        </div>
    </div>
</template>