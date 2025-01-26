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

const filteredTasks = computed(() => {
  return taskStore.tasks.filter((task) => {
    if (!filters.value.showDeleted && task.deletedAt) return false;
    if (
      filters.value.selectedCategory &&
      task.category !== filters.value.selectedCategory
    )
      return false;
    if (filters.value.selectedLabels.length > 0) {
      const hasSelectedLabel = task.labels.some((label) =>
        filters.value.selectedLabels.includes(label)
      );
      if (!hasSelectedLabel) return false;
    }
    return true;
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

const handleLogout = async () => {
  await authStore.logout();
  router.push("/");
};

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
    <div class="max-w-5xl mx-auto">
      <div class="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex items-center gap-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p class="text-gray-600 text-lg">Stay Organized and Productive</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <template v-if="authStore.isAuthenticated">
            <span class="text-gray-600">{{
              authStore.user?.user_metadata?.name || authStore.user?.email
            }}</span>
            <button @click="handleLogout" class="btn-secondary">Logout</button>
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
          <button
            @click="toggleCalendar"
            class="btn-secondary flex items-center gap-2"
          >
            <CalendarIcon class="w-5 h-5" />
            {{ showCalendar ? "Hide Calendar" : "Show Calendar" }}
          </button>
        </div>
      </div>

      <template v-if="authStore.isAuthenticated">
        <!-- Calendar (Collapsible) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform -translate-y-4"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-4"
        >
          <div v-if="showCalendar" class="mb-6">
            <TaskCalendar
              :tasks="filteredTasks"
              @select:task="handleTaskSelect"
            />
          </div>
        </Transition>

        <!-- Main Content -->
        <div class="space-y-4">
          <!-- Add Task Form -->
          <div
            class="bg-white rounded-xl shadow-md border border-indigo-300 p-4"
          >
            <TaskInput @add:task="addTask" />
          </div>

          <!-- Task List -->
          <div v-if="taskStore.loading" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"
            ></div>
          </div>

          <TransitionGroup v-else name="slide-fade" tag="div" class="space-y-3">
            <TaskItem
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              :id="`task-${task.id}`"
              @update:task="updateTask"
              @delete:task="deleteTask"
              @restore:task="restoreTask"
              @permanent:delete="permanentlyDeleteTask"
            />
          </TransitionGroup>

          <p
            v-if="filteredTasks.length === 0 && !taskStore.loading"
            class="text-center text-gray-100 mt-8 bg-indigo-600 p-4 rounded-lg"
          >
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
