<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";
import { Task, TaskFilter } from "../types/task";
import TaskItem from "../components/TaskItem.vue";
import TaskInput from "../components/TaskInput.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskCalendar from "../components/TaskCalendar.vue";
import { CalendarIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";
import BaseTooltip from "../components/BaseTooltip.vue";
import LoadingComponent from "../components/LoadingComponent.vue";
import Header from "../components/Header.vue";
import Welcome from "./Welcome.vue";
// import Welcome from "./Welcome.vue";

const taskStore = useTaskStore();
const authStore = useAuthStore();
const showCalendar = ref(false);
const showTaskForm = ref(true);

const pageLoading = ref(true); // New ref for page loading state
const selectedTaskId = ref<string | null>(null);
const toast = useToast();

const filters = ref<TaskFilter>({
  showDeleted: false,
  selectedLabels: [],
  selectedCategory: undefined,
  startDate: undefined,
  endDate: undefined,
});

onMounted(async () => {
  try {
    if (authStore.isAuthenticated) {
      // Simulate loading time for data fetching
      await new Promise(resolve => setTimeout(resolve, 500));
      await taskStore.fetchTasks();
    }
  } finally {
    pageLoading.value = false;
  }
});

const filteredTasks = computed(() => {
  // If a specific task is selected from calendar, only show that task
  if (selectedTaskId.value) {
    return taskStore.tasks.filter((task) => task.id === selectedTaskId.value);
  }

  // Get base tasks based on deleted status
  let tasks = filters.value.showDeleted
    ? taskStore.getDeletedTasks
    : taskStore.getActiveTasks;

  // Apply category filter
  if (filters.value.selectedCategory) {
    tasks = tasks.filter(
      (task) => task.category === filters.value.selectedCategory
    );
  }

  // Apply labels filter
  if (filters.value.selectedLabels.length > 0) {
    tasks = tasks.filter((task) =>
      task.labels.some((label) => filters.value.selectedLabels.includes(label))
    );
  }

  // Update the date filtering logic in filteredTasks computed property
  if (filters.value.startDate || filters.value.endDate) {
    tasks = tasks.filter((task) => {
      if (!task.dueDate) return false;

      // Convert filter dates to local Date objects
      const taskDate = new Date(task.dueDate);
      const taskTime = taskDate.getTime();

      // Start date handling (beginning of day)
      const startDate = filters.value.startDate
        ? new Date(filters.value.startDate)
        : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);

      // End date handling (end of day)
      const endDate = filters.value.endDate
        ? new Date(filters.value.endDate)
        : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      return (
        (!startDate || taskTime >= startDate.getTime()) &&
        (!endDate || taskTime <= endDate.getTime())
      );
    });
  }
  return tasks;
});

const addTask = async (
  title: string,
  dueDate?: Date,
  category?: string,
  labels: string[] = []
) => {
  await taskStore.createTask({
    title,
    dueDate,
    category,
    labels,
  });
};

const updateTask = async (updatedTask: Task) => {
  await taskStore.updateTask(updatedTask.id, updatedTask);
};

const deleteTask = async (id: string) => {
  await taskStore.deleteTask(id);
};

// Add a new method to handle permanent deletion
const permanentlyDeleteTask = async (id: string) => {
  await taskStore.permanentlyDeleteTask(id);
};

// Add restore task method
const restoreTask = async (id: string) => {
  await taskStore.restoreTask(id);
};

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value;
};

const toggleTaskForm = () => {
  showTaskForm.value = !showTaskForm.value;
};

const handleTaskSelect = (taskId: string) => {
  selectedTaskId.value = taskId;
  nextTick(() => {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
      taskElement.classList.add("ring-2", "ring-indigo-500");
      setTimeout(() => {
        taskElement.classList.remove("ring-2", "ring-indigo-500");
      }, 2000);
    }
  });
};

const clearTaskSelection = () => {
  selectedTaskId.value = null;
  // Reset any date filters when clearing task selection
  // this below is causing the date range filters unable to work/
  // filters.value.startDate = undefined;
  // filters.value.endDate = undefined;
};

// However, if the user changes a filter (e.g., date, category, labels, deleted status, etc.), the selected task is cleared automatically to ensure that the user sees the relevant filtered results.
watch(filters, () => {
  clearTaskSelection();
}, { deep: true });


watch(
  () => filters.value,
  (newVal, oldVal) => {
    // Show deleted filter - only show toast when filter is turned ON
    if (newVal.showDeleted !== oldVal.showDeleted && newVal.showDeleted) {
      toast.info("Showing deleted tasks");
    }
    // Show deleted filter
    // if (newVal.showDeleted !== oldVal.showDeleted) {
    //   toast.info(
    //     newVal.showDeleted ? "Showing deleted tasks" : ""
    //   );
    // }

    // Category filter
    if (newVal.selectedCategory !== oldVal.selectedCategory) {
      if (newVal.selectedCategory) {
        toast.success(`Category filter: ${newVal.selectedCategory}`);
      } else {
        toast.info("Category filter cleared");
      }
    }

    // Label filter
    if (newVal.selectedLabels.length !== oldVal.selectedLabels.length) {
      if (newVal.selectedLabels.length > 0) {
        toast.success(`Labels selected: ${newVal.selectedLabels.join(", ")}`);
      } else {
        toast.info("Label filters cleared");
      }
    }

    // Date range filter
    if (
      newVal.startDate !== oldVal.startDate ||
      newVal.endDate !== oldVal.endDate
    ) {
      if (newVal.startDate || newVal.endDate) {
        const start = newVal.startDate || "Any";
        const end = newVal.endDate || "Any";
        toast.success(`Date range: ${start} to ${end}`);
      } else {
        toast.info("Date range filter cleared");
      }
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="min-h-screen bg-emerald-50 py-9 px-4 sm:px-6">

    <LoadingComponent v-if="pageLoading" />

    <div v-else class="max-w-4xl mx-auto">

      <!-- header -->
      <Header />
      <!-- header end -->

      <template v-if="authStore.isAuthenticated">
        <div class="flex items-center gap-2">
          <!-- task filter -->
          <TaskFilters v-model="filters" />
          <!-- Calendar Toggle Button -->
          <BaseTooltip text="Toggle calendar view">
            <button @click="toggleCalendar" class="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 
                     border border-gray-400 flex items-center gap-2">
              <CalendarIcon class="w-5 h-5" />
              <span class="hidden sm:inline">
                {{ showCalendar ? "Hide Calendar" : "Show Calendar" }}
              </span>
            </button>
          </BaseTooltip>

          <!-- Task Form Toggle Button -->
          <BaseTooltip text="Toggle task form">
            <button @click="toggleTaskForm" class="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 
                     border border-gray-400 flex items-center gap-2">
              <component :is="showTaskForm ? MinusCircleIcon : PlusCircleIcon" class="w-5 h-5" />
              <span class="hidden sm:inline">
                {{ showTaskForm ? "Hide Form" : "Show Form" }}
              </span>
            </button>
          </BaseTooltip>
        </div>

        <div class="mt-3">
          <!-- Calendar (Collapsible) -->
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 transform -translate-y-4" enter-to-class="opacity-100 transform translate-y-0"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 transform translate-y-0" leave-to-class="opacity-0 transform -translate-y-4">
            <div v-if="showCalendar" class="mb-6">
              <TaskCalendar :tasks="taskStore.tasks" @select:task="handleTaskSelect" />
              <div v-if="selectedTaskId" class="mt-2 flex justify-end">
                <button @click="clearTaskSelection"
                  class="text-sm text-emerald-600 hover:text-gray-50 bg-emerald-100 hover:bg-emerald-400 border border-emerald-500  hover:border-emerald-50 rounded-lg p-2">
                  Show All
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Main Content -->
        <div class="space-y-4">
          <!-- Add Task Form -->
          <div v-if="showTaskForm" class="bg-white rounded-xl shadow-md border border-indigo-300 p-4">
            <TaskInput @add:task="addTask" />
          </div>
          <!-- Task List -->
          <div v-if="taskStore.loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
          <TransitionGroup v-else name="slide-fade" tag="div" class="space-y-3">
            <TaskItem v-for="task in filteredTasks" :key="task.id" :task="task" :id="`task-${task.id}`"
              @update:task="updateTask" @delete:task="deleteTask" @restore:task="restoreTask"
              @permanent:delete="permanentlyDeleteTask" />
          </TransitionGroup>
          <p v-if="filteredTasks.length === 0 && !taskStore.loading"
            class="text-center text-gray-100 mt-8 bg-indigo-600 p-4 rounded-lg">
            No tasks found. Try adjusting your filters or add a new task!
          </p>
        </div>
      </template>

      <!-- Welcome Screen -->
      <Welcome v-else />
    </div>
  </div>
</template>
