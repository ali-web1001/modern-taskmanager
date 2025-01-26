<script setup lang="ts">
import { TASK_CATEGORIES, TASK_LABELS, type TaskFilter } from "../types/task";
import { ref } from "vue";
import { FunnelIcon} from "@heroicons/vue/24/outline";

const showFilters = ref(false);

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

const resetFilters = () => {
  updateFilter({
    showDeleted: false,
    selectedLabels: [],
    selectedCategory: undefined,
  });
  showFilters.value = true;
};

const closeFilters = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".filter-dropdown")) {
    showFilters.value = false;
  }
};

// Add click outside listener
if (typeof window !== "undefined") {
  window.addEventListener("click", closeFilters);
}
</script>

<template>
  <div class="relative inline-block text-left filter-dropdown">
    <!-- Filter Button -->
    <button
      @click.stop="showFilters = !showFilters"
      class="bg-gray-200 p-2 border border-gray-300 rounded flex items-center gap-2"
      :class="{ 'ring-2 ring-indigo-500': showFilters }"
    >
      <FunnelIcon class="w-5 h-5" />
      <span>Filters</span>
      <!-- Active Filters Indicator -->
      <span
        v-if="
          modelValue.showDeleted ||
          modelValue.selectedCategory ||
          modelValue.selectedLabels.length > 0
        "
        class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600"
      >
        {{
          (modelValue.showDeleted ? 1 : 0) +
          (modelValue.selectedCategory ? 1 : 0) +
          (modelValue.selectedLabels.length > 0 ? 1 : 0)
        }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showFilters"
      class="absolute left-0 z-10 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      @click.stop
    >
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">Filters</h3>
          <button
            @click="resetFilters"
            class="text-gray-500 hover:text-indigo-600 transition-colors"
            title="Reset filters"
          >
            <!-- <XCircleIcon class="w-5 h-5" /> -->
            Reset All
          </button>
        </div>
        <!-- Show Deleted Tasks -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-700">Show deleted tasks</span>

          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="modelValue.showDeleted"
              @change="updateFilter({ showDeleted: !modelValue.showDeleted })"
              class="sr-only peer"
            />
            <div
              class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"
            ></div>
          </label>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Category</label
          >
          <div class="relative">
            <select
              v-model="modelValue.selectedCategory"
              @change="
                updateFilter({
                  selectedCategory: ($event.target as HTMLSelectElement).value,
                })
              "
              class="input-primary w-full text-sm appearance-none pr-8"
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

        <!-- Labels Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Labels</label
          >
          <div class="flex flex-wrap gap-1.5">
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
