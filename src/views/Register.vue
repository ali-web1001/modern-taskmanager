<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { UserPlusIcon } from "@heroicons/vue/24/solid";
import Header from "../components/Header.vue";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = "";
    await authStore.register(email.value, password.value, name.value);
    router.push("/");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-indigo-100 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <Header v-if="!authStore.isAuthenticated" />

    <div class="px-4 py-2 sm:px-6 md:px-8 lg:px-10">
      <h1 class="text-center text-2xl font-serif mb-2 mt-5 sm:mt-8 md:mt-12 lg:mt-16 text-gray-600 dark:text-gray-300">
        Manage Daily Tasks With Ease
      </h1>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-bold text-gray-900 dark:text-gray-200">
        Create Your New Account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-500 dark:text-gray-300">
        Or
        <router-link to="/login"
          class="font-medium text-indigo-600 dark:text-indigo-500 hover:text-indigo-500 underline">
          Sign in to your account
        </router-link>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-50 dark:bg-indigo-100 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div v-if="error" class="rounded-md bg-red-100 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
              </div>
            </div>
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div class="mt-1">
              <input id="name" v-model="name" type="text" required autocomplete="name"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-indigo-50 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input id="email" v-model="email" type="email" required autocomplete="email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-indigo-50 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input id="password" v-model="password" type="password" required autocomplete="new-password" minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-indigo-50 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <button type="submit" :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <UserPlusIcon v-if="!loading" class="h-5 w-5 mr-2" />
              <svg v-else class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? "Creating account..." : "Create account" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
