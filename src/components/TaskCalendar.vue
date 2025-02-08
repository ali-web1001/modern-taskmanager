<script setup lang="ts">
import { ref, computed } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay } from 'date-fns';
import { Task } from '../types/task';

const props = defineProps<{
  tasks: Task[];
}>();

const emit = defineEmits<{
  'select:task': [taskId: string];
}>();

const currentDate = ref(new Date());

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);
  return eachDayOfInterval({ start, end });
});

const tasksForDate = (date: Date) => {
  return props.tasks.filter(task =>
    task.dueDate && isSameDay(new Date(task.dueDate), date)
  );
};

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1);
};

// In your TaskCalendar.vue, update the selectTask method:
const selectTask = (taskId: string, event: Event) => {
  event.stopPropagation(); // Prevent date cell click event
  emit('select:task', taskId);
};

</script>

<template>

  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-indigo-300 dark:border-indigo-400 p-5">
    <div class="flex items-center justify-between mb-6">

      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
        {{ format(currentDate, 'MMMM yyyy') }}
      </h2>

      <div class="flex gap-2">
        <button @click="previousMonth"
          class="p-2 border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-200">Previous</button>
        <button @click="nextMonth"
          class="p-2 border border-gray-400  hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-200">Next</button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2">

      <template v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']">
        <div class="p-2 text-center text-sm font-medium text-gray-500">
          {{ day }}
        </div>
      </template>

      <template v-for="date in calendarDays" :key="date.toISOString()">

        <div class="p-2 border border-gray-300 rounded-lg" :class="{
          'bg-indigo-50 border-indigo-200 dark:bg-indigo-600': isToday(date),
          'bg-gray-50 border-gray-200  dark:bg-gray-900': !isToday(date) && isSameMonth(date, currentDate),
          'bg-gray-100 border-gray-300  dark:bg-gray-900': !isSameMonth(date, currentDate)
        }">
          <div class="text-sm font-medium mb-1" :class="{
            'text-indigo-600 dark:text-indigo-100': isToday(date),
            'text-gray-900': !isToday(date) && isSameMonth(date, currentDate),
            'text-gray-400': !isSameMonth(date, currentDate)
          }">
            {{ format(date, 'd') }}
          </div>

          <div class="space-y-1">
            <button v-for="task in tasksForDate(date)" :key="task.id" @click="(e) => selectTask(task.id, e)"
              class="w-full text-left text-xs p-1 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-indigo-50 border border-gray-200 truncate hover:bg-indigo-50 dark:hover:bg-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors"
              :class="{ 'line-through opacity-70': task.completed }">
              {{ task.title }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>