<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { PlusIcon, TagIcon } from "@heroicons/vue/24/outline";
import { TASK_CATEGORIES, TASK_LABELS } from "../types/task";
import { isBefore, startOfDay, startOfToday } from "date-fns";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useCategoryStore } from "../stores/categories";
import { useLabelStore } from "../stores/labels";
import { onMounted } from "vue";

const categoryStore = useCategoryStore();
const labelStore = useLabelStore();

const emit = defineEmits<{
  "add:task": [
    title: string,
    dueDate: Date | undefined,
    category: string | undefined,
    labels: string[]
  ];
}>();

const newTask = ref("");
const selectedCategory = ref<string>();
const selectedLabels = ref<string[]>([]);
const showLabels = ref(false);
const showDatePicker = ref(false);
const error = ref("");
const categorySelect = ref<HTMLSelectElement | null>(null);

// Compute minimum selectable date (today)
const minDate = computed(() => startOfToday());
const dueDate = ref<Date>();

const categoryError = ref("");
const dueDateError = ref("");

const openDropdown = () => {
  // In most browsers, we can't programmatically open a select dropdown directly
  // But we can focus it and then simulate pressing the space key to open it
  if (categorySelect.value) {
    categorySelect.value.focus();

    // Create and dispatch a keyboard event (Space key) to open the dropdown
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true
    });

    categorySelect.value.dispatchEvent(event);
  }
};

// Fetch custom categories and labels on mount
onMounted(() => {
  categoryStore.fetchCustomCategories();
  labelStore.fetchCustomLabels();
});

// Combined watch for all form fields
watch(
  [newTask, selectedCategory, dueDate],
  ([newTaskValue, categoryValue, dateValue]) => {
    // Clear task error if task has value
    if (newTaskValue.trim()) {
      error.value = "";
    }
    // Clear category error if category is selected
    if (categoryValue) {
      categoryError.value = "";
    }
    // Clear date error if date is selected
    if (dateValue) {
      dueDateError.value = "";
    }
  }
);

const addTask = () => {
  error.value = "";
  categoryError.value = "";
  dueDateError.value = "";

  if (!newTask.value.trim()) {
    error.value = "Please enter a task title";
    return;
  }

  if (!selectedCategory.value) {
    categoryError.value = "Please select a category";
  }

  if (!dueDate.value) {
    dueDateError.value = "Please select a due date";
  }

  if (error.value || categoryError.value || dueDateError.value) {
    return; // Stop execution if there are errors
  }

  emit(
    "add:task",
    newTask.value.trim(),
    dueDate.value,
    selectedCategory.value,
    selectedLabels.value
  );

  // Reset form after adding task
  newTask.value = "";
  dueDate.value = undefined;
  selectedCategory.value = undefined;
  selectedLabels.value = [];
  showDatePicker.value = false;
};

const toggleLabel = (label: string) => {
  const index = selectedLabels.value.indexOf(label);
  if (index === -1) {
    selectedLabels.value.push(label);
  } else {
    selectedLabels.value.splice(index, 1);
  }
};

const handleDateSelect = (date: Date | null) => {
  const today = startOfToday();
  if (date && !isBefore(startOfDay(date), today)) {
    dueDate.value = date;
  }
};

// const handleDateInput = (event: Event) => {
//   const selectedDate = (event.target as HTMLInputElement).valueAsDate;
//   const today = startOfToday();
//
//   // Only allow dates that are today or in the future
//   if (selectedDate && !isBefore(startOfDay(selectedDate), today)) {
//     dueDate.value = selectedDate;
//   }
// };

// const formatDate = (date: Date | undefined) => {
//   if (!date) return "";
//   return format(date, "MMM d, yyyy");
// };
//
// const toggleDatePicker = (event: MouseEvent) => {
//   event.stopPropagation(); // Prevent event from bubbling up
//   showDatePicker.value = !showDatePicker.value;
// };
//
// // Enhanced date selection handler with validation
// const handleDateSelect = (val: { date: Date }) => {
//   const selectedDate = startOfDay(val.date); // Normalize to start of day
//   const today = startOfToday();
//
//   // Only allow selection if date is today or in the future
//   if (!isBefore(selectedDate, today)) {
//     dueDate.value = selectedDate;
//     showDatePicker.value = false;
//   }
// };
//
// // Calendar attributes to handle disabled dates and highlighting
// const calendarAttributes = computed(() => [
//   {
//     // Highlight selected date
//     highlight: {
//       color: "indigo",
//       fillMode: "solid",
//     },
//     dates: dueDate.value ? [dueDate.value] : [],
//   },
//   {
//     // Disable past dates
//     highlight: {
//       color: "gray",
//       fillMode: "light",
//     },
//     dot: false,
//     dates: { start: null, end: minDate.value },
//     order: -1,
//     type: "disabled",
//   },
// ]);

</script>

<template>
  <form @submit.prevent="addTask" class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <label for="category" class="block text-gray-700 dark:text-gray-100 font-medium mb-1">Add Task <span
            class="text-red-500">*</span></label>
        <textarea v-model="newTask" type="text" placeholder="Add a new task..."
          class="input-primary w-full flex-1 transition-all text-gray-700 dark:text-gray-100 duration-100 rounded-md outline-none bg-white dark:bg-gray-900"
          :class="{
            'border border-red-600 ring-1 ring-red-300': error,
            'border border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500': !error
          }" />
        <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- Category  -->
    <div class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">

        <label class="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">Select Category<span
            class="text-red-500"> *</span></label>

        <div class="relative">
          <select v-model="selectedCategory" ref="categorySelect"
            class="input-primary border border-gray-400 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-50 w-full appearance-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 outline-none">

            <option value="Select Category" disabled selected>
              Select Category
            </option>

            <!-- Default Categories -->
            <optgroup label="Default Categories">
              <option v-for="category in TASK_CATEGORIES" :key="category" :value="category">
                {{ category }}
              </option>
            </optgroup>

            <!-- Custom Categories -->
            <optgroup v-if="categoryStore.customCategories.length > 0" label="Custom Categories">
              <option v-for="category in categoryStore.customCategories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </optgroup>

          </select>

          <p v-if="categoryError" class="mt-2 text-sm text-red-600">
            {{ categoryError }}
          </p>

          <!-- Clear Button -->
          <button v-if="selectedCategory" type="button" @click="selectedCategory = ''"
            class="absolute inset-y-0 right-8 flex items-center justify-center text-gray-400 dark:text-gray-50 hover:text-indigo-600 dark:hover:text-indigo-500 transition-all duration-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Arrow icon with click handler -->
          <div @click="openDropdown"
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-50  hover:text-indigo-600 dark:hover:text-indigo-500">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-[200px] relative">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-50 mb-1"> Due Date <span
            class="text-red-500">*</span></label>

        <VueDatePicker v-model="dueDate" :min-date="minDate" :is-required="true" :action-row="{ showNow: true }"
          now-button-label="Current" arrow-navigation @change="handleDateSelect" format="MMM d, yyyy"
          class="border border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 w-full rounded-md outline-none"
          :class="{ 'border-red-400 focus:ring-red-200': dueDateError }" />

        <p v-if="dueDateError" class="mt-1 text-sm text-red-600">
          {{ dueDateError }}
        </p>

      </div>
    </div>

    <div>
      <button type="button" @click="showLabels = !showLabels"
        class="flex items-center border border-gray-400 dark:border-gray-400 px-3 py-2 text-gray-600 dark:text-gray-50 rounded-lg  focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200">
        <TagIcon class="w-5 h-5 mr-1.5" />
        {{ showLabels ? "Hide Labels" : "Show Labels" }}
      </button>

      <div v-if="showLabels" class="mt-3 flex flex-wrap gap-2">
        <button v-for="label in TASK_LABELS" :key="label.name" type="button" @click="toggleLabel(label.name)"
          class="px-3 py-1 flex items-center gap-2 rounded-full text-sm" :class="selectedLabels.includes(label.name)
            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
            : 'bg-gray-100 text-gray-700 border border-gray-400'
            ">
          <component :is="label.icon" class="w-4 h-4" />
          {{ label.name }}
        </button>

        <!-- Custom Labels -->
        <button v-for="label in labelStore.customLabels" type="button" :key="label.name"
          @click="toggleLabel(label.name)" class="px-3 py-1 rounded-full text-sm mb-2 mt-1" :class="selectedLabels.includes(label.name)
            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
            : 'bg-gray-100 text-gray-700 border border-gray-400'
            ">
          {{ label.name }}
        </button>
      </div>
    </div>

    <button type="submit" class="btn-primary dark:hover:bg-indigo-500 whitespace-nowrap">
      <PlusIcon class="w-5 h-5 mr-1.5" />
      Submit
    </button>
  </form>
</template>

<!-- <style scoped>
/* Remove blue dots and customize calendar appearance */
:deep(.vc-container) {
  --vc-color: rgb(99 102 241);
  --vc-accent-50: transparent;
  --vc-accent-100: transparent;
  --vc-accent-200: transparent;
  --vc-accent-300: transparent;
  --vc-accent-400: transparent;
  --vc-accent-500: transparent;
  --vc-accent-600: transparent;
  --vc-accent-700: transparent;
  --vc-accent-800: transparent;
  --vc-accent-900: transparent;
}

:deep(.vc-day.is-selected) {
  background-color: rgb(99 102 241);
  /* Indigo color for selected date */
  color: white;
}

:deep(.vc-day-content) {
  border-radius: 9999px;
  /* Full rounded */
  transition: all 0.2s ease;
}

:deep(.vc-day:hover .vc-day-content) {
  background-color: rgba(99, 102, 241, 0.1);
  /* Light indigo hover effect */
}
</style> -->
