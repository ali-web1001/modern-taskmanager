<script setup lang="ts">
import { TASK_CATEGORIES, TASK_LABELS, type TaskFilter } from "../types/task";

const props = defineProps<{
  modelValue: TaskFilter;
}>();

const emit = defineEmits<{
  "update:modelValue": [filter: TaskFilter];
}>();

const updateFilter = (updates: Partial<TaskFilter>) => {
  emit("update:modelValue", {
    ...props.modelValue,
    ...updates,
  });
};

const toggleLabel = (label: string) => {
  const labels = props.modelValue.selectedLabels;
  const newLabels = labels.includes(label)
    ? labels.filter((l) => l !== label)
    : [...labels, label];
  updateFilter({ selectedLabels: newLabels });
};
</script>

<template>
  <div
    class="space-y-6 bg-white rounded-xl shadow-sm border border-indigo-300 p-6"
  >
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
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Select Category</label
          >

          <div class="relative">
            <select
              v-model="modelValue.selectedCategory"
              @change="
                updateFilter({
                  selectedCategory: ($event.target as HTMLSelectElement).value,
                })
              "
              class="input-primary w-full appearance-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option
                v-for="category in TASK_CATEGORIES"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <!-- Clear Button -->
            <button
              v-if="modelValue.selectedCategory"
              type="button"
              @click="modelValue.selectedCategory = ''"
              class="absolute inset-y-0 right-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all duration-200 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
            >
              <svg
                class="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Labels</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="label in TASK_LABELS"
              :key="label"
              @click="toggleLabel(label)"
              class="px-3 py-1 rounded-full text-sm"
              :class="
                modelValue.selectedLabels.includes(label)
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
