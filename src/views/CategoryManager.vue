<template>
  
  <div class="min-h-screen bg-indigo-100 dark:bg-gray-950 py-12 px-4 sm:px-6">

    <div class="max-w-4xl mx-auto pt-16 sm:pt-20 pb-9 px-2 sm:px-6">
      <Header />
      <!-- Back Button -->
      <div class="mb-5">
        <button @click="router.push('/')" class="flex items-center text-indigo-600 hover:text-indigo-700">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Tasks
        </button>
      </div>

      <div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-100">Manage Categories</h2>

        <!-- Add Category Form -->
        <form @submit.prevent="addCategory" class="mb-8">
          <div class="flex flex-col sm:flex-row gap-4">
            <input v-model="newCategory" type="text" placeholder="Enter new category"
              class="flex-1 w-full input-primary border border-gray-400" required />
            <button type="submit" :disabled="loading"
              class="btn-primary w-full sm:w-auto dark:hover:bg-indigo-700 whitespace-nowrap">
              <PlusIcon class="w-5 h-5 mr-2" />
              Add
            </button>
          </div>
        </form>

        <!-- Categories List -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Your Categories</h3>

          <div v-if="categoryStore.loading" class="text-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          </div>

          <div v-else-if="categoryStore.customCategories.length === 0" class="text-center py-4 text-gray-500">
            No custom categories yet
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li v-for="category in categoryStore.customCategories" :key="category.id"
              class="py-3  flex items-center justify-between">

              <div class="flex items-center gap-4 flex-1">

                <span v-if="!editingId || editingId !== category.id" class="text-gray-700 dark:text-gray-200">
                  {{ category.name }}
                </span>

                <input v-else v-model="editedName" type="text" class="flex-1 input-primary border border-gray-300"
                  @keyup.enter="updateCategory(category.id)" @keyup.esc="cancelEdit" />
              </div>
              <div class="flex items-center gap-2">

                <button v-if="!editingId || editingId !== category.id" @click="startEdit(category)"
                  class="text-indigo-600 hover:text-indigo-800 p-2">
                  <PencilIcon class="w-5 h-5" />
                </button>

                <button v-else @click="updateCategory(category.id)" class="text-green-600 hover:text-green-800 p-2">
                  <CheckIcon class="w-5 h-5" />
                </button>

                <button @click="deleteCategory(category.id)" class="text-red-600 hover:text-red-800 p-2">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Predefined Categories -->
        <div class="mt-8">
          <h3 class="text-lg text-gray-700 dark:text-indigo-500 font-semibold mb-4">Default Categories</h3>

          <div class="flex flex-wrap gap-2">
            <span v-for="category in TASK_CATEGORIES" :key="category"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {{ category }}
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
import { useCategoryStore } from '../stores/categories';
import { TASK_CATEGORIES } from '../types/task';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';
import Header from '../components/Header.vue';

const router = useRouter();
const categoryStore = useCategoryStore();
const newCategory = ref('');
const loading = ref(false);
const editingId = ref<string | null>(null);
const editedName = ref('');

// Fetch categories on mount
categoryStore.fetchCustomCategories();

const addCategory = async () => {
  if (!newCategory.value.trim()) return;

  loading.value = true;
  try {
    await categoryStore.addCategory(newCategory.value.trim());
    newCategory.value = '';
  } finally {
    loading.value = false;
  }
};

const startEdit = (category: { id: string, name: string }) => {
  editingId.value = category.id;
  editedName.value = category.name;
};

const cancelEdit = () => {
  editingId.value = null;
  editedName.value = '';
};

const updateCategory = async (id: string) => {
  if (!editedName.value.trim() || editedName.value.trim() === '') return;

  try {
    await categoryStore.updateCategory(id, editedName.value.trim());
    cancelEdit();
  } catch (error) {
    console.error('Failed to update category:', error);
  }
};

const deleteCategory = async (id: string) => {
  try {
    await categoryStore.deleteCategory(id);
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
};
</script>