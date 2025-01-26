<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "../stores/tasks";
import { useAuthStore } from "../stores/auth";
import { Task, TaskFilter } from "../types/task";
import TaskItem from "../components/TaskItem.vue";
import TaskInput from "../components/TaskInput.vue";
import TaskFilters from "../components/TaskFilters.vue";
import TaskCalendar from "../components/TaskCalendar.vue";

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();

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
</script>

<template>
  <div class="min-h-screen bg-purple-50 py-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="mb-10 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-3">Task Manager</h1>
          <p class="text-gray-600 text-lg">Stay organized and productive</p>
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

      <template v-if="authStore.isAuthenticated">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-2">
            <TaskCalendar :tasks="filteredTasks" />
          </div>

          <div class="lg:col-span-2">
            <TaskFilters v-model="filters" />
          </div>
          
          <div class="lg:col-span-4 space-y-6">
            <div
              class="bg-white rounded-2xl shadow-md border border-indigo-300 p-6"
            >
              <TaskInput @add:task="addTask" />
            </div>

            <div v-if="taskStore.loading" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"
              ></div>
            </div>

            <TransitionGroup
              v-else
              name="slide-fade"
              tag="div"
              class="space-y-4"
            >
              <TaskItem
                v-for="task in filteredTasks"
                :key="task.id"
                :task="task"
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
          </div>
        </div>
      </template>

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
