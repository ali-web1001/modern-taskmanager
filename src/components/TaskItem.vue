<script setup lang="ts">
import { ref, computed } from "vue";
import { format, isPast, isToday, formatDistanceToNow } from "date-fns";
import { Task } from "../types/task";
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowUturnLeftIcon,
  TagIcon,
} from "@heroicons/vue/24/outline";

// Define props with Task type
const props = defineProps<{
  task: Task;
}>();

// Explicitly type the emits with custom event types
const emit = defineEmits<{
  (e: "update:task", task: Task): void;
  (e: "delete:task", id: string): void;
  (e: "restore:task", id: string): void;
}>();

const isEditing = ref(false);
const editedTitle = ref(props.task.title);
const editedDueDate = ref(
  props.task.dueDate
    ? props.task.dueDate.toISOString().split("T")[0]
    : ""
);
const editedCategory = ref<string | undefined>(props.task.category);
const editedLabels = ref<string[]>(props.task.labels || []);
const newLabel = ref("");

const toggleComplete = () => {
  emit("update:task", {
    ...props.task,
    completed: !props.task.completed,
  });
};

const startEditing = () => {
  isEditing.value = true;
  editedTitle.value = props.task.title;
  editedDueDate.value = props.task.dueDate
    ? props.task.dueDate.toISOString().split("T")[0]
    : "";
  editedCategory.value = props.task.category;
  editedLabels.value = [...(props.task.labels || [])];
};

const saveEdit = () => {
  if (editedTitle.value.trim()) {
    emit("update:task", {
      ...props.task,
      title: editedTitle.value.trim(),
      dueDate: editedDueDate.value ? new Date(editedDueDate.value) : undefined,
      category: editedCategory.value?.trim() || undefined,
      labels: editedLabels.value.filter((label) => label.trim()),
    });
    isEditing.value = false;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  editedTitle.value = props.task.title;
  editedDueDate.value = props.task.dueDate
    ? props.task.dueDate.toISOString().split("T")[0]
    : "";
  editedCategory.value = props.task.category;
  editedLabels.value = [...(props.task.labels || [])];
};

const deleteTask = () => {
  emit("delete:task", props.task.id);
};

const restoreTask = () => {
  emit("restore:task", props.task.id);
};

const addLabel = () => {
  if (
    newLabel.value.trim() &&
    !editedLabels.value.includes(newLabel.value.trim())
  ) {
    editedLabels.value.push(newLabel.value.trim());
    newLabel.value = "";
  }
};

const removeLabel = (label: string) => {
  editedLabels.value = editedLabels.value.filter((l) => l !== label);
};

const formatDate = (date: Date) => {
  return format(date, "MMM d, yyyy");
};

const getDueStatus = computed(() => {
  if (!props.task.dueDate) return null;

  const date = props.task.dueDate;

  if (props.task.completed) {
    return {
      text: "Completed",
      class: "bg-green-100 text-green-800",
    };
  } else if (isPast(date) && !isToday(date)) {
    return {
      text: `Past due by ${formatDistanceToNow(date)}`,
      class: "bg-red-100 text-red-800",
    };
  } else if (isToday(date)) {
    return {
      text: "Due today",
      class: "bg-yellow-100 text-yellow-800",
    };
  } else {
    return {
      text: `Due in ${formatDistanceToNow(date)}`,
      class: "bg-blue-100 text-blue-800",
    };
  }
});
</script>

<template>
  <div
    class="task-card group"
    :class="{
      'opacity-75': task.completed,
      'bg-gray-50': task.deletedAt,
    }"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center flex-1 min-w-0">
        <button
          @click="toggleComplete"
          class="p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
          :disabled="!!task.deletedAt"
        >
          <CheckCircleIcon
            class="w-6 h-6 transition-colors"
            :class="task.completed ? 'text-indigo-500' : 'text-gray-400'"
          />
        </button>

        <div v-if="!isEditing" class="ml-3 flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="text-gray-700 text-lg"
              :class="{ 'line-through text-gray-400': task.completed }"
            >
              {{ task.title }}
            </span>

            <span
              v-if="task.category"
              class="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-sm"
            >
              {{ task.category }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-3 mt-2">
            <div class="mt-2 text-sm text-gray-500">
              Created {{ formatDate(new Date(task.createdAt)) }}
            </div>

            <span
              v-if="task.dueDate && getDueStatus"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="getDueStatus.class"
            >
              {{ getDueStatus.text }}
            </span>

            <div
              v-if="task.dueDate"
              class="flex items-center gap-2 text-sm text-gray-500"
            >
              <CalendarIcon class="w-4 h-4" />
              <span>Due Date: {{ formatDate(task.dueDate) }}</span>
            </div>

            <div
              v-if="task.deletedAt"
              class="flex items-center gap-2 text-sm text-red-500"
            >
              <TrashIcon class="w-4 h-4" />
              <span>Deleted: {{ formatDate(task.deletedAt) }}</span>
            </div>
          </div>

          <div v-if="task.labels?.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="label in task.labels"
              :key="label"
              class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs"
            >
              {{ label }}
            </span>
          </div>
        </div>

        <!-- <input
          v-else
          v-model="editedTitle"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
          class="ml-3 flex-1 p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          type="text"
          
        /> -->

        <div v-else class="ml-3 flex-1 space-y-4">
          <!-- Title Input -->
          <input
            v-model="editedTitle"
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            class="w-full p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            type="text"
            ref="editInput"
            placeholder="Task title"
          />

          <!-- Due Date Input -->
          <div class="flex items-center gap-2">
            <CalendarIcon class="w-5 h-5 text-gray-400" />
            <input
              v-model="editedDueDate"
              type="date"
              class="p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <!-- Category Input -->
          <div class="flex items-center gap-2">
            <TagIcon class="w-5 h-5 text-gray-400" />
            <input
              v-model="editedCategory"
              type="text"
              placeholder="Category"
              class="p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <!-- Labels Input -->
          <div class="space-y-2">

            <div class="flex items-center gap-2">
              <input
                v-model="newLabel"
                @keyup.enter="addLabel"
                type="text"
                placeholder="Add label"
                class="flex-1 p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                @click="addLabel"
                class="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
              >
                Add
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="label in editedLabels"
                :key="label"
                class="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs"
              >
                {{ label }}
                <button
                  @click="removeLabel(label)"
                  class="ml-1.5 text-indigo-500 hover:text-indigo-700"
                >
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </span>

            </div>

          </div>

        </div>

      </div>

      <div
        class="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <template v-if="!isEditing">
          <template v-if="task.deletedAt">
            <button
              @click="restoreTask"
              class="btn-secondary p-2 hover:bg-green-50 hover:text-green-500 hover:border-green-200"
            >
              <ArrowUturnLeftIcon class="w-4 h-4" />
            </button>
          </template>

          <template v-else>
            <button @click="startEditing" class="btn-secondary p-2">
              <PencilIcon class="w-4 h-4" />
            </button>

            <button
              @click="deleteTask"
              class="btn-secondary p-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </template>
        </template>

        <template v-else>
          <button @click="saveEdit" class="btn-primary py-1.5 px-3">
            Save
          </button>

          <button @click="cancelEdit" class="btn-secondary p-2">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
