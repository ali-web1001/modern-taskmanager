<script setup lang="ts">
import { ref, computed } from "vue";
import { PlusIcon, TagIcon } from "@heroicons/vue/24/outline";
import { TASK_CATEGORIES, TASK_LABELS } from "../types/task";
import { isBefore, startOfDay, startOfToday } from "date-fns";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

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

// Compute minimum selectable date (today)
const minDate = computed(() => startOfToday());
const dueDate = ref<Date>();
// Close datepicker when clicking outside
// const datePickerRef = ref(null);
// const handleClickOutside = (event: MouseEvent) => {
//   if (
//     datePickerRef.value &&
//     !(datePickerRef.value as HTMLElement).contains(event.target as HTMLElement)
//   ) {
//     showDatePicker.value = false;
//   }
// };

// Add click outside listener
// if (typeof window !== "undefined") {
//   window.addEventListener("click", handleClickOutside);
// }

const addTask = () => {
  if (newTask.value.trim()) {
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
  }
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
      <input
        v-model="newTask"
        type="text"
        placeholder="Add a new task..."
        class="input-primary flex-1 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
      />
      <button type="submit" class="btn-primary whitespace-nowrap">
        <PlusIcon class="w-5 h-5 mr-1.5" />
        Add Task
      </button>
    </div>

    <!-- Category  -->
    <div class="flex-1 min-w-[200px]">
      <label class="block text-sm font-medium text-gray-700 mb-1"
        >Select Category</label
      >

      <div class="relative">
        <select
          v-model="selectedCategory"
          class="input-primary w-full appearance-none focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <option value="Select Category" disabled selected>
            Select Category
          </option>
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
          v-if="selectedCategory"
          type="button"
          @click="selectedCategory = ''"
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

    <!-- Due Date -->
    <!-- <div class="flex-1 min-w-[200px] relative">
      <label class="block text-sm font-medium text-gray-700 mb-1"
        >Due Date</label
      >
      <div class="relative" ref="datePickerRef">
        <button
          type="button"
          @click="toggleDatePicker"
          class="input-primary w-full text-left flex items-center justify-between"
        >
          <span :class="{ 'text-gray-400': !dueDate }">
            {{ dueDate ? formatDate(dueDate) : "Select due date" }}
          </span>
          <CalendarIcon class="w-5 h-5 text-gray-400" />
        </button>

        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showDatePicker"
            class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            @click.stop
          >
            <v-calendar
              :model-value="dueDate"
              @dayclick="handleDateSelect"
              class="rounded-lg"
              :min-date="minDate"
              :attributes="calendarAttributes"
              is-expanded
              trim-weeks
              disable-page-swipe
              :masks="{
                input: 'MMM D, YYYY',
                title: 'MMMM YYYY',
              }"
              :can-move-prev="false"
            />
          </div>
        </Transition>
      </div>
    </div> -->

    <!-- <div class="relative">
      <input
        type="date"
        class="input-primary w-full focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
        :min="format(minDate, 'yyyy-MM-dd')"
        @input="handleDateInput"
      />
    </div> -->

    <div class="flex-1 min-w-[200px] relative">
      <label class="block text-sm font-medium text-gray-700 mb-1"
        >Due Date</label
      >
      <VueDatePicker
        v-model="dueDate"
        :min-date="minDate"
        :is-required="true"
        :action-row="{ showNow: true }"
        now-button-label="Current"
        arrow-navigation
        @change="handleDateSelect"
        format="MMM d, yyyy"
        class="border border-gray-300 w-full rounded-md"
      />
    </div>

    <div>
      <button
        type="button"
        @click="showLabels = !showLabels"
        class="btn-secondary focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
      >
        <TagIcon class="w-5 h-5 mr-1.5" />
        {{ showLabels ? "Hide Labels" : "Show Labels" }}
      </button>

      <div v-if="showLabels" class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="label in TASK_LABELS"
          :key="label"
          type="button"
          @click="toggleLabel(label)"
          class="px-3 py-1 rounded-full text-sm"
          :class="
            selectedLabels.includes(label)
              ? 'bg-indigo-200 text-indigo-700 border-indigo-200'
              : 'bg-gray-100 text-gray-700 border-gray-200'
          "
        >
          {{ label }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
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
  background-color: rgb(99 102 241); /* Indigo color for selected date */
  color: white;
}

:deep(.vc-day-content) {
  border-radius: 9999px; /* Full rounded */
  transition: all 0.2s ease;
}

:deep(.vc-day:hover .vc-day-content) {
  background-color: rgba(99, 102, 241, 0.1); /* Light indigo hover effect */
}
</style>
