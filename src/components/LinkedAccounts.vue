<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useToast } from "vue-toastification";
import type { Provider, UserIdentity } from "@supabase/supabase-js";

// Helper type to make working with identity_data easier
interface IdentityData {
  email?: string;
  [key: string]: any;
}

const authStore = useAuthStore();
const toast = useToast();
const errorMessage = ref<string | null>(null);

// State management with proper typing
const linkedAccounts = ref<UserIdentity[]>([]);
const loading = ref(false);

// Computed function to safely get email from identity_data
const getIdentityEmail = (identity: UserIdentity): string => {
  const identityData = identity.identity_data as IdentityData;
  return identityData?.email || "No email available";
};

// Load accounts when component mounts
onMounted(async () => {
  await loadLinkedAccounts();
});

async function loadLinkedAccounts() {
  try {
    loading.value = true;
    linkedAccounts.value = await authStore.getLinkedIdentities();
    toast.success('Accounts loaded successfully');
  } catch (error) {
    toast.error("Failed to load linked accounts");
    console.error("Error loading accounts:", error);
  } finally {
    loading.value = false;
  }
}

async function linkNewProvider(provider: Provider) {
  try {
    loading.value = true;
    errorMessage.value = null; // Reset error before linking
    await authStore.linkIdentity(provider);
    toast.success(`Started linking ${provider} account`);
  } catch (error: any) {
    errorMessage.value = error.message || "An unexpected error occurred.";
    toast.error(errorMessage.value);
    console.error("Error linking provider:", error);
  } finally {
    loading.value = false;
  }
}

async function unlinkProvider(identity: UserIdentity) {
  try {
    loading.value = true;
    await authStore.unlinkIdentity(identity);
    await loadLinkedAccounts(); // Refresh the list
    toast.success("Account unlinked successfully");
  } catch (error: any) {
    toast.error(error.message || "Failed to unlink account.");
    console.error("Error unlinking provider:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-8">
    <!-- <h2 class="text-2xl font-bold mb-4">Linked Accounts</h2> -->
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-300 ">Loading...</div>
    <div v-else>
      <!-- Show existing linked accounts -->
      <div v-for="identity in linkedAccounts" :key="identity.id"
        class="flex flex-wrap justify-between items-center p-4 mb-2 border rounded">
        <div>
          <span class="font-medium text-gray-500 dark:text-gray-300 text-wrap uppercase">{{ identity.provider }}</span>
          <span class="text-sm text-gray-500 dark:text-gray-200 ml-2">{{
            getIdentityEmail(identity)
            }}</span>
        </div>

        <button @click="unlinkProvider(identity)" class="text-red-600 hover:text-red-800" title="to unlink an account"
          :disabled="linkedAccounts.length < 2">
          Unlink
        </button>
      </div>

      <!-- Add new provider buttons -->
      <div class="mt-4 space-y-2">
        <button @click="linkNewProvider('github')" title="Link Github"
          class="w-full flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-950 text-gray-500 dark:text-gray-300">
          <img src="https://github.com/favicon.ico" alt="GitHub"
            class="w-5 h-5 mr-2 bg-gray-500 dark:bg-gray-300 border rounded-xl" />
          Link GitHub Account
        </button>

        <button @click="linkNewProvider('google')" :disabled="true" title="Currently Unavailable"
          class="w-full flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-950 text-gray-500 dark:text-gray-300">
          <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 mr-2" />
          Link Google Account
        </button>
      </div>
    </div>
  </div>
</template>
