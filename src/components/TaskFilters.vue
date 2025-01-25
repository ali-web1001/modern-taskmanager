<script setup lang="ts">
import { TASK_CATEGORIES, TASK_LABELS, type TaskFilter } from '../types/task';

const props = defineProps<{
  modelValue: TaskFilter;
}>();

const emit = defineEmits<{
  'update:modelValue': [filter: TaskFilter];
}>();

const updateFilter = (updates: Partial<TaskFilter>) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...updates,
  });
};

const toggleLabel = (label: string) => {
  const labels = props.modelValue.selectedLabels;
  const newLabels = labels.includes(label)
    ? labels.filter(l => l !== label)
    : [...labels, label];
  updateFilter({ selectedLabels: newLabels });
};
</script>

<template>
  <div class="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Filters</h3>
      
      <div class="space-y-4">
        <div>
          <label class="flex items-center">
            <input
              type="checkbox"
              :checked="modelValue.showDeleted"
              @change="updateFilter({ showDeleted: !modelValue.showDeleted })"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="ml-2 text-gray-700">Show deleted tasks</span>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="modelValue.selectedCategory"
            @change="updateFilter({ selectedCategory: ($event.target as HTMLSelectElement).value })"
            class="input-primary w-full"
          >
            <option value="">All Categories</option>
            <option v-for="category in TASK_CATEGORIES" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Labels</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="label in TASK_LABELS"
              :key="label"
              @click="toggleLabel(label)"
              class="px-3 py-1 rounded-full text-sm"
              :class="modelValue.selectedLabels.includes(label)
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'"
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>