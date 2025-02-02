<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useToast } from "vue-toastification";
import { supabase } from "../lib/supabase";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // First check for hash parameters (some OAuth providers use hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);

    // Check both hash and search parameters for errors
    const errorParam = hashParams.get("error") || searchParams.get("error");
    const errorDescription = hashParams.get("error_description") ||
      searchParams.get("error_description");

    if (errorParam) {
      console.error("OAuth Error:", errorParam, errorDescription);
      throw new Error(errorDescription || "Authentication failed");
    }

    // Handle the OAuth callback
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data.session) {
      throw new Error("No session found after authentication");
    }

    // Update auth store
    await authStore.checkAuth();

    toast.success("Successfully signed in!");

    // Redirect to home or intended page
    const redirectPath = localStorage.getItem("authRedirect") || "/";
    localStorage.removeItem("authRedirect");
    await router.replace(redirectPath);

  } catch (err) {
    console.error("Auth callback error:", err);
    error.value = err instanceof Error ? err.message : "Authentication failed";
    toast.error(error.value);

    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center p-8 bg-white rounded-lg shadow-md">
      <template v-if="!error">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Completing sign in...</p>
      </template>

      <template v-else>
        <div class="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-700">{{ error }}</p>
        <p class="mt-2 text-sm text-gray-500">Redirecting to login...</p>
      </template>
    </div>
  </div>
</template>