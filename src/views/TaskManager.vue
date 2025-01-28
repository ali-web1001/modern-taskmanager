<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";
import { Task, TaskFilter } from "../types/task";
import TaskItem from "../components/TaskItem.vue";
import TaskInput from "../components/TaskInput.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskCalendar from "../components/TaskCalendar.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline";
import UserMenu from "../components/UserMenu.vue";

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const showCalendar = ref(false);
// const selectedTaskRef = ref<HTMLElement | null>(null);

const filters = ref<TaskFilter>({
  showDeleted: false,
  selectedLabels: [],
  selectedCategory: undefined,
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await taskStore.fetchTasks();
  }
});

// Helper function to check if a task matches the current filters
const taskMatchesFilters = (task: Task) => {
  // When showing deleted tasks, we'll handle them separately in the sorting
  if (filters.value.showDeleted) {
    // Include both deleted and non-deleted tasks, they'll be sorted later
    return true;
  }

  // Don't show deleted tasks when showDeleted is false
  if (task.deletedAt) return false;

  // Check category
  if (
    filters.value.selectedCategory &&
    task.category !== filters.value.selectedCategory
  )
    return false;

  // Check labels
  if (filters.value.selectedLabels.length > 0) {
    const hasSelectedLabel = task.labels.some((label) =>
      filters.value.selectedLabels.includes(label)
    );
    if (!hasSelectedLabel) return false;
  }

  // Check date range
  if (filters.value.startDate || filters.value.endDate) {
    if (!task.dueDate) return false;

    const taskDate = new Date(task.dueDate);

    if (filters.value.startDate) {
      const startDate = new Date(filters.value.startDate);
      if (taskDate < startDate) return false;
    }

    if (filters.value.endDate) {
      const endDate = new Date(filters.value.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      if (taskDate > endDate) return false;
    }
  }

  return true;
};

// Helper function to calculate task priority score
const getTaskPriorityScore = (task: Task) => {
  let score = 0;

  // When showing deleted tasks, prioritize them at the top
  if (filters.value.showDeleted) {
    // Assign highest priority to deleted tasks
    if (task.deletedAt) {
      score += 1000;
      // Add recency bonus for deleted tasks (more recently deleted = higher priority)
      const deletedDaysAgo = Math.ceil(
        (Date.now() - task.deletedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 30 - deletedDaysAgo); // Bonus points for recently deleted items
    }
  }

  // Apply regular filter scoring for both deleted and non-deleted tasks
  // Prioritize tasks that match the selected category
  if (
    filters.value.selectedCategory &&
    task.category === filters.value.selectedCategory
  ) {
    score += 100;
  }

  // Add points for each matching label
  if (filters.value.selectedLabels.length > 0) {
    const matchingLabels = task.labels.filter((label) =>
      filters.value.selectedLabels.includes(label)
    );
    score += matchingLabels.length * 50;
  }

  // Consider due date (tasks due sooner get higher priority)
  if (task.dueDate && !task.deletedAt) {
    // Only consider due dates for non-deleted tasks
    const daysUntilDue = Math.ceil(
      (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue < 0) {
      score += 75; // Overdue tasks
    } else if (daysUntilDue === 0) {
      score += 50; // Due today
    } else if (daysUntilDue <= 7) {
      score += 25; // Due this week
    }
  }

  return score;
};

const filteredTasks = computed(() => {
  // First, filter tasks based on criteria
  const matchingTasks = taskStore.tasks.filter(taskMatchesFilters);

  // If no filters are active and we're not showing deleted tasks,
  // return tasks in their original order
  const hasActiveFilters =
    filters.value.selectedCategory ||
    filters.value.selectedLabels.length > 0 ||
    filters.value.showDeleted;

  if (!hasActiveFilters) {
    return matchingTasks;
  }

  // Sort tasks based on priority score
  return [...matchingTasks].sort((a, b) => {
    const scoreA = getTaskPriorityScore(a);
    const scoreB = getTaskPriorityScore(b);

    // Sort by score (descending) and then by relevant date
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // For deleted tasks, sort by deletion date
    if (a.deletedAt && b.deletedAt) {
      return b.deletedAt.getTime() - a.deletedAt.getTime();
    }

    // For regular tasks, sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
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

// const handleLogout = async () => {
//   await authStore.logout();
//   router.push("/");
// };

const navigateToLogin = () => {
  router.push("/login");
};

const navigateToRegister = () => {
  router.push("/register");
};

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value;
};

const handleTaskSelect = (taskId: string) => {
  // Find the task element
  nextTick(() => {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add highlight effect
      taskElement.classList.add("ring-2", "ring-indigo-500");
      setTimeout(() => {
        taskElement.classList.remove("ring-2", "ring-indigo-500");
      }, 2000);
    }
  });
};
</script>

<template>
  <div class="min-h-screen bg-purple-50 py-6 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p class="text-gray-600 text-lg">Stay Organized and Productive</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="authStore.isAuthenticated">
            <UserMenu />
          </template>

          <template v-else>
            <button @click="navigateToLogin" class="btn-primary">
              Sign In
            </button>
            <button @click="navigateToRegister" class="btn-secondary">
              Sign Up
            </button>
          </template>
        </div>
      </div>

      <div class="mb-3">
        <div class="flex items-center gap-2" v-if="authStore.isAuthenticated">
          <TaskFilters v-model="filters" />
          <button @click="toggleCalendar" class="btn-secondary flex items-center gap-2">
            <CalendarIcon class="w-5 h-5" />
            {{ showCalendar ? "Hide Calendar" : "Show Calendar" }}
          </button>
        </div>
      </div>

      <template v-if="authStore.isAuthenticated">
        <!-- Calendar (Collapsible) -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform -translate-y-4" enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 transform translate-y-0" leave-to-class="opacity-0 transform -translate-y-4">
          <div v-if="showCalendar" class="mb-6">
            <TaskCalendar :tasks="filteredTasks" @select:task="handleTaskSelect" />
          </div>
        </Transition>

        <!-- Main Content -->
        <div class="space-y-4">
          <!-- Add Task Form -->
          <div class="bg-white rounded-xl shadow-md border border-indigo-300 p-4">
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
          <!-- Sidebar (Right) -->
          <!-- <div class="space-y-4"></div> -->
        </div>
      </template>

      <!-- Welcome Screen -->
      <template v-else>
        <div class="text-center py-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to Task Manager
          </h2>
          <p class="text-gray-600 mb-8">
            Please sign in or create an account to manage your tasks.
          </p>
          <div class="flex justify-center gap-4">
            <button @click="navigateToLogin" class="btn-primary px-8">
              Sign In
            </button>
            <button @click="navigateToRegister" class="btn-secondary px-8">
              Sign Up
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
