<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { ArrowLeftIcon } from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";
import LoadingComponent from "../components/LoadingComponent.vue";
import LinkedAccounts from '../components/LinkedAccounts.vue';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const name = ref("");
const email = ref("");
const avatar = ref("");
const avatarFile = ref<File | null>(null);
const loading = ref(false);
const pageLoading = ref(true); // New ref for page loading state
const success = ref(false);
const error = ref("");

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      router.push("/login");
      return;
    }

    // Simulate loading time for data fetching
    await new Promise(resolve => setTimeout(resolve, 500));

    name.value = authStore.user?.user_metadata?.name || "";
    email.value = authStore.user?.email || "";
    avatar.value = authStore.user?.user_metadata?.avatar_url || "";
  } finally {
    pageLoading.value = false;
  }
});

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0];
    avatar.value = URL.createObjectURL(input.files[0]);
  }
};

const updateProfile = async () => {
  try {
    loading.value = true;
    error.value = "";

    const updateData: { name: string; avatar_url?: string | File } = {
      name: name.value,
    };

    if (avatarFile.value) {
      updateData.avatar_url = avatarFile.value; // Pass the File object directly
    }

    await authStore.updateProfile(updateData);

    success.value = true;
    toast.success("Profile Updated Successfully!");

    setTimeout(() => {
      success.value = false;
      router.push("/");
    }, 2000);
  } catch (err: any) {
    error.value = err.message;
    toast.error("Profile Failed to Update!");
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push("/");
};
</script>

<template>
  <div class="">
    <div class="min-h-screen bg-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <!-- Show loading component while page is loading -->
      <LoadingComponent v-if="pageLoading" />

      <div v-else class="max-w-4xl mx-auto">
        <!-- BreadCrumb -->
        <div class="mb-6">
          <button @click="goBack" class="flex items-center text-indigo-600 hover:text-indigo-600">
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Back To Tasks
          </button>
        </div>

        <div class="bg-white shadow-lg rounded-lg overflow-hidden p-8">
          <div class="px-6 py-8">
            <div class="text-center mb-8">
              <div class="mb-4 relative">
                <div
                  class="w-24 h-24 rounded-full bg-indigo-100 mx-auto flex items-center justify-center overflow-hidden group">
                  <img v-if="avatar" :src="avatar" :alt="name" class="w-24 h-24 object-cover" />
                  <span v-else class="text-4xl text-indigo-600">
                    {{ name.charAt(0).toUpperCase() }}
                  </span>

                  <!-- Overlay for hover effect -->
                  <div
                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span class="text-white text-sm">Change Photo</span>
                  </div>

                  <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="handleAvatarChange" />
                </div>
              </div>
              <h2 class="text-2xl font-bold text-gray-900">Profile Settings</h2>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- Success Message -->
              <div v-if="success" class="rounded-md bg-green-50 p-4 mb-4">
                <div class="flex">
                  <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">
                      Profile Updated Redirecting...
                    </p>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
                <div class="flex">
                  <div class="ml-3">
                    <p class="text-sm font-medium text-red-800">
                      {{ error }}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input type="email" v-model="email" disabled
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500" />
                <p class="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input type="text" v-model="name" required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div class="flex justify-between">
                <button type="button" @click="goBack" class="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-300 
                     border border-gray-400 flex items-center gap-2">
                  Cancel
                </button>

                <button type="submit" :disabled="loading" class="p-2 bg-indigo-500 text-gray-100 rounded-lg hover:bg-indigo-600 
                     border border-gray-400 flex items-center gap-2">
                  <svg v-if="loading" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  {{ loading ? "Saving..." : "Save Changes" }}
                </button>
              </div>
            </form>
            <div class="mt-10 border-t pt-6">
              <h3 class="text-xl text-sr font-semibold text-gray-900 mb-4">Linked Accounts</h3>
              <LinkedAccounts />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
