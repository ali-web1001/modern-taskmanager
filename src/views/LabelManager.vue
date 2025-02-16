<template>
  <div class="min-h-screen bg-indigo-100 dark:bg-gray-950 py-12 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto pt-16 sm:pt-20 pb-9 px-2 sm:px-6">
      <Header />

      <!-- Back Button -->
      <div class="mb-6">
        <button @click="router.push('/')" class="flex items-center text-indigo-600 hover:text-indigo-700">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Tasks
        </button>
      </div>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 class="text-2xl text:gray-700 dark:text-gray-100 font-bold mb-6">Manage Labels</h2>

        <!-- Add Label Form -->
        <form @submit.prevent="addLabel" class="mb-8">
          <div class="flex flex-col sm:flex-row gap-4">
            <input v-model="newLabel" type="text" placeholder="Enter new label"
              class="flex-1 w-full input-primary border border-gray-300" required />
            <button type="submit" :disabled="loading"
              class="btn-primary w-full sm:w-auto dark:hover:bg-indigo-700 whitespace-nowrap">
              <PlusIcon class="w-5 h-5 mr-2" />
              Add Label
            </button>
          </div>
        </form>

        <!-- Labels List -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4 text:gray-700 dark:text-gray-100">Your Labels</h3>

          <div v-if="labelStore.loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          </div>

          <div v-else-if="labelStore.customLabels.length === 0" class="text-center py-4 text-gray-500">
            No custom labels yet
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li v-for="label in labelStore.customLabels" :key="label.id" class="py-3 flex items-center justify-between">

              <span class="text:gray-700 dark:text-gray-100">{{ label.name }}</span>

              <button @click="deleteLabel(label.id)" class="text-red-600 hover:text-red-800 p-2">
                <TrashIcon class="w-5 h-5" />
              </button>
            </li>
          </ul>
        </div>

        <!-- Predefined Labels -->
        <div class="mt-8">
          <h3 class="text-lg font-semibold mb-4 text:gray-700 dark:text-indigo-500">Default Labels</h3>

          <div class="flex flex-wrap gap-2">
            <span v-for="label in TASK_LABELS" :key="label.name"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
              <component :is="label.icon" class="w-4 h-4" />
              {{ label.name }}
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLabelStore } from '../stores/labels';
import { TASK_LABELS } from '../types/task';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import Header from '../components/Header.vue';

const router = useRouter();
const labelStore = useLabelStore();
const newLabel = ref('');
const loading = ref(false);

// Fetch labels on mount
labelStore.fetchCustomLabels();

const addLabel = async () => {
  if (!newLabel.value.trim()) return;

  loading.value = true;
  try {
    await labelStore.addLabel(newLabel.value.trim());
    newLabel.value = '';
  } finally {
    loading.value = false;
  }
};

const deleteLabel = async (id: string) => {
  try {
    await labelStore.deleteLabel(id);
  } catch (error) {
    console.error('Failed to delete label:', error);
  }
};
</script>