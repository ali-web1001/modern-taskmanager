<script setup lang="ts">
import { ref, computed } from "vue";
import { PlusIcon, TagIcon, CalendarIcon } from "@heroicons/vue/24/outline";
import { TASK_CATEGORIES, TASK_LABELS } from "../types/task";
import { format, startOfToday, isBefore, startOfDay } from "date-fns";

const emit = defineEmits<{
  "add:task": [
    title: string,
    dueDate: Date | undefined,
    category: string | undefined,
    labels: string[]
  ];
}>();

const newTask = ref("");
const dueDate = ref<Date>();
const selectedCategory = ref<string>();
const selectedLabels = ref<string[]>([]);
const showLabels = ref(false);
const showDatePicker = ref(false);

// Compute minimum selectable date (today)
const minDate = computed(() => startOfToday());

// Close datepicker when clicking outside
const datePickerRef = ref(null);
const handleClickOutside = (event: MouseEvent) => {
  if (
    datePickerRef.value &&
    !(datePickerRef.value as HTMLElement).contains(event.target as HTMLElement)
  ) {
    showDatePicker.value = false;
  }
};

// Add click outside listener
if (typeof window !== "undefined") {
  window.addEventListener("click", handleClickOutside);
}

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

const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return format(date, "MMM d, yyyy");
};

const toggleDatePicker = (event: MouseEvent) => {
  event.stopPropagation(); // Prevent event from bubbling up
  showDatePicker.value = !showDatePicker.value;
};

// Enhanced date selection handler with validation
const handleDateSelect = (val: { date: Date }) => {
  const selectedDate = startOfDay(val.date); // Normalize to start of day
  const today = startOfToday();

  // Only allow selection if date is today or in the future
  if (!isBefore(selectedDate, today)) {
    dueDate.value = selectedDate;
    showDatePicker.value = false;
  }
};

// Calendar attributes to handle disabled dates and highlighting
const calendarAttributes = computed(() => [
  {
    // Highlight selected date
    highlight: {
      color: "indigo",
      fillMode: "solid",
    },
    dates: dueDate.value ? [dueDate.value] : [],
  },
  {
    // Disable past dates
    highlight: {
      color: "gray",
      fillMode: "light",
    },
    dot: false,
    dates: { start: null, end: minDate.value },
    order: -1,
    type: "disabled",
  },
]);
</script>

<template>
  <form @submit.prevent="addTask" class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="newTask"
        type="text"
        placeholder="Add a new task..."
        class="input-primary flex-1"
      />
      <button type="submit" class="btn-primary whitespace-nowrap">
        <PlusIcon class="w-5 h-5 mr-1.5" />
        Add Task
      </button>
    </div>

    <div class="flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Category</label
        >
        <select v-model="selectedCategory" class="input-primary w-full">
          <option value="">Select Category</option>
          <option
            v-for="category in TASK_CATEGORIES"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div class="flex-1 min-w-[200px] relative">
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
      </div>
    </div>

    <div>
      <button
        type="button"
        @click="showLabels = !showLabels"
        class="btn-secondary"
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
              ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
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
:deep(.vc-container) {
  --vc-color: rgb(99 102 241);
  --vc-accent-50: rgb(238 242 255);
  --vc-accent-100: rgb(224 231 255);
  --vc-accent-200: rgb(199 210 254);
  --vc-accent-300: rgb(165 180 252);
  --vc-accent-400: rgb(129 140 248);
  --vc-accent-500: rgb(99 102 241);
  --vc-accent-600: rgb(79 70 229);
  --vc-accent-700: rgb(67 56 202);
  --vc-accent-800: rgb(55 48 163);
  --vc-accent-900: rgb(49 46 129);
}

:deep(.vc-day.is-disabled) {
  opacity: 0.4;
  cursor: not-allowed !important;
  pointer-events: none;
}

:deep(.vc-day.is-disabled .vc-day-content) {
  color: var(--vc-gray-400);
  text-decoration: line-through;
}

:deep(.vc-header .vc-prev.is-disabled),
:deep(.vc-header .vc-next.is-disabled) {
  visibility: hidden;
}
</style>
