<script setup lang="ts">
import { ref, computed } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay } from 'date-fns';
import { Task } from '../types/task';

const props = defineProps<{
  tasks: Task[];
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
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ format(currentDate, 'MMMM yyyy') }}
      </h2>
      <div class="flex gap-2">
        <button @click="previousMonth" class="btn-secondary">
          Previous
        </button>
        <button @click="nextMonth" class="btn-secondary">
          Next
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <template v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']">
        <div class="p-2 text-center text-sm font-medium text-gray-500">
          {{ day }}
        </div>
      </template>

      <template v-for="date in calendarDays" :key="date.toISOString()">
        <div
          class="p-2 border rounded-lg"
          :class="{
            'bg-indigo-50 border-indigo-200': isToday(date),
            'bg-gray-50 border-gray-200': !isToday(date) && isSameMonth(date, currentDate),
            'bg-gray-100 border-gray-300': !isSameMonth(date, currentDate)
          }"
        >
          <div class="text-sm font-medium mb-1"
            :class="{
              'text-indigo-600': isToday(date),
              'text-gray-900': !isToday(date) && isSameMonth(date, currentDate),
              'text-gray-400': !isSameMonth(date, currentDate)
            }"
          >
            {{ format(date, 'd') }}
          </div>
          
          <div class="space-y-1">
            <div
              v-for="task in tasksForDate(date)"
              :key="task.id"
              class="text-xs p-1 rounded bg-white border border-gray-200 truncate"
              :class="{ 'line-through opacity-50': task.completed }"
            >
              {{ task.title }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>