<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { LockClosedIcon } from "@heroicons/vue/24/solid";
import type { Provider } from "@supabase/supabase-js";
import { useToast } from "vue-toastification";
import Header from "../components/Header.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const toast = useToast();

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = "";
    await authStore.login(email.value, password.value);
    router.push("/");
  } catch (err: any) {
    error.value = err.message;
    toast.error(err.message || "Failed to sign in.");
  } finally {
    loading.value = false;
  }
};

const handleSocialLogin = async (provider: Provider) => {
  try {
    error.value = "";
    // // Store the intended redirect path
    // const redirect = router.query.redirect as string;
    // if (redirect) {
    //   localStorage.setItem("authRedirect", redirect);
    // }
    await authStore.loginWithProvider(provider);
  } catch (err: any) {
    error.value = err.message;
    toast.error(err.message || "Social login failed.");
  }
};
</script>

<template>
  <div class="min-h-screen bg-indigo-100 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <Header v-if="!authStore.isAuthenticated" />

      <div>
        <h1 class="text-center text-2xl font-serif mb-5 text-gray-600 dark:text-gray-300">
         Welcome Back!
        </h1>
      </div>

      <h2 class="text-center text-3xl font-bold text-gray-900 dark:text-gray-200">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-500">
        Or
        <router-link to="/register" class="font-medium text-indigo-500 hover:text-indigo-500 underline">
          Create a New Account
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-50 dark:bg-indigo-100 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
        <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
          <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3">
          <button @click="handleSocialLogin('github')"
            class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white dark:bg-indigo-50 hover:bg-gray-50">
            <img src="https://github.com/favicon.ico" alt="GitHub" class="w-5 h-5 mr-2" />
            Continue with GitHub
          </button>

          <button @click="handleSocialLogin('google')" :disabled="true"
            class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white dark:bg-indigo-50 hover:bg-gray-50">
            <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />
            Continue with Google
          </button>
        </div>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-50 text-gray-600">Or continue with</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input id="email" v-model="email" type="email" required autocomplete="email"
                class="appearance-none block w-full px-3 py-2 bg-white dark:bg-indigo-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input id="password" v-model="password" type="password" required autocomplete="current-password"
                class="appearance-none block w-full px-3 py-2 bg-white dark:bg-indigo-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <LockClosedIcon v-if="!loading" class="h-5 w-5 mr-2" />
              <svg v-else class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? "Signing in..." : "Sign in" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
