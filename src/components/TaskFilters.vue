<script setup lang="ts">
import { TASK_CATEGORIES, TASK_LABELS, type TaskFilter } from "../types/task";
import { onMounted, onUnmounted, ref } from "vue";
import { FunnelIcon } from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";

const showFilters = ref(false);
const toast = useToast();

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
  const labels = [...props.modelValue.selectedLabels];

  const newLabels = labels.includes(label)
    ? labels.filter((l) => l !== label)
    : [...labels, label];
  updateFilter({ selectedLabels: newLabels });
};

const resetFilters = () => {
  updateFilter({
    showDeleted: false,
    selectedLabels: [],
    selectedCategory: "",
    startDate: undefined,
    endDate: undefined,
  });
  showFilters.value = false;
  toast.success("All filters cleared");
};

const closeFilters = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".filter-dropdown")) {
    showFilters.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", closeFilters);
});

onUnmounted(() => {
  window.removeEventListener("click", closeFilters);
});

</script>

<template>
  <div class="relative inline-block text-left filter-dropdown">
    <!-- Filter Button -->
    <button @click.stop="showFilters = !showFilters"
      class="bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 border border-gray-400 flex items-center gap-2"
      :class="{ 'ring-2 ring-indigo-500': showFilters }">
      <FunnelIcon class="w-5 h-5 text-gray-700 dark:text-gray-300" />
      <span>Filters</span>
      <!-- Active Filters Indicator -->

      <span v-if="
        modelValue.showDeleted ||
        modelValue.selectedCategory ||
        modelValue.selectedLabels.length > 0 ||
        modelValue.startDate ||
        modelValue.endDate
      "
        class="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
        {{
          (modelValue.showDeleted ? 1 : 0) +
          (modelValue.selectedCategory ? 1 : 0) +
          (modelValue.selectedLabels.length > 0 ? 1 : 0) +
          (modelValue.startDate || modelValue.endDate ? 1 : 0)
        }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="showFilters"
      class="absolute left-0 z-10 mt-2 w-72 origin-top-right bg-indigo-100/95 dark:bg-gray-950/95 p-2 rounded-lg hover:bg-indigo-200/95 dark:hover:bg-indigo-950/95 border border-gray-400 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      @click.stop>
      <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-300">Filters</h3>
          <button @click="resetFilters"
            class=" text-gray-900 dark:text-gray-300 hover:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            title="Reset Filters">
            <!-- <XCircleIcon class="w-5 h-5" /> -->
            Reset All
          </button>
        </div>

        <!-- Date Range Filter -->
        <div class="space-y-2">
          <label class="block text-sm font-medium  text-gray-900 dark:text-gray-300">Due Date Range</label>
          <div class="space-y-1">
            <div>
              <label class="text-xs text-gray-900 dark:text-gray-300">From</label>
              <input type="date" :value="modelValue.startDate" @input="
                updateFilter({
                  startDate:
                    ($event.target as HTMLInputElement).value || undefined,
                })
                "
                class="input-primary w-full text-sm border border-gray-400 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div>
              <label class="text-xs  text-gray-900 dark:text-gray-300">To</label>
              <!-- //the date inputs were using v-model directly on the modelValue.startDate and modelValue.endDate. But in Vue, mutating props directly isn't recommended. Instead, the solution changed to using :value to bind the input's value and @input to handle changes. This way, when the user picks a date, the @input event triggers an updateFilter call, which emits the new value to the parent component. -->
              <input type="date" :value="modelValue.endDate" @input="
                updateFilter({
                  endDate:
                    // The TypeScript error about $event.target being possibly null was fixed by type-casting the event target to HTMLInputElement. This tells TypeScript that we're sure the target is an input element, so accessing .value is safe. Also, converting empty strings to undefined ensures the filter state stays clean.
                    ($event.target as HTMLInputElement).value || undefined,
                })
                "
                class="input-primary w-full text-sm border border-gray-400 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-800" />
            </div>
          </div>
        </div>

        <!-- Show Deleted Tasks -->
        <div class="flex items-center justify-between">
          <span class="text-sm transition-colors"
            :class="modelValue.showDeleted ? 'text-red-600' : ' text-gray-900 dark:text-gray-300'">
            Show deleted tasks
          </span>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" :checked="modelValue.showDeleted"
              @change="updateFilter({ showDeleted: !modelValue.showDeleted })" class="sr-only peer" />
            <div
              class="w-9 h-5 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600">
            </div>
          </label>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <div class="relative">

            <select v-model="modelValue.selectedCategory" @change="
              updateFilter({
                selectedCategory: ($event.target as HTMLSelectElement).value,
              })
              "
              class="input-primary border border-gray-400 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 w-full appearance-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm pr-8 cursor-pointer">
              <option value="">All Categories</option>
              <option v-for="category in TASK_CATEGORIES" :key="category" :value="category">
                {{ category }}
              </option>
            </select>

            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>

            <!-- Clear Button -->
            <button v-if="modelValue.selectedCategory" type="button" @click="updateFilter({ selectedCategory: '' })"
              class="absolute inset-y-0 right-8 flex items-center justify-center text-gray-400 dark:text-gray-200 hover:text-indigo-400 dark:hover:text-indigo-300 transition-all duration-200 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Labels Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</label>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="label in TASK_LABELS" :key="label.name" @click="toggleLabel(label.name)"
              class="px-3 py-1 rounded-full text-sm" :class="modelValue.selectedLabels.includes(label.name)
                ? 'border-r-2 border-indigo-300 dark:border-indigo-600 bg-indigo-100 text-indigo-700 dark:text-gray-900 dark:bg-gray-200'
                : 'border-r-2 border-gray-400 bg-gray-100 text-gray-600 dark:text-gray-300 dark:bg-gray-800'
                ">
              {{ label.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
