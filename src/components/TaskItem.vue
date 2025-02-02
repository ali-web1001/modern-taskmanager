<script setup lang="ts">
import { ref, computed } from "vue";
import { format, isPast, isToday, formatDistanceToNow, parseISO } from "date-fns";
import { Task } from "../types/task";
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";

import TaskDetailOverlay from './TaskDetailOverlay.vue';

// Define props with Task type
const props = defineProps<{
  task: Task;
}>();

// const viewTask = () => {
//   // emit("view:task", props.task.id);  // You can define this custom event to show the task details in another way
// };

// Explicitly type the emits with custom event types
const emit = defineEmits<{
  (e: "update:task", task: Task): void;
  (e: "delete:task", id: string): void;
  (e: "restore:task", id: string): void;
  (e: "permanent:delete", id: string): void; // Add this new event type
}>();

const isEditing = ref(false);
const editedTitle = ref(props.task.title);
const editedDueDate = ref(
  props.task.dueDate ? props.task.dueDate.toISOString().split("T")[0] : ""
);
const showDetails = ref(false);

const editedCategory = ref<string | undefined>(props.task.category);
const editedLabels = ref<string[]>(props.task.labels || []);
const newLabel = ref("");
const errors = ref<{ title?: string; dueDate?: string; category?: string }>({});

const toggleComplete = () => {
  emit("update:task", {
    ...props.task,
    completed: !props.task.completed,
  });
};

const validate = () => {
  errors.value = {}; // Reset errors

  if (!editedTitle.value.trim()) {
    errors.value.title = "Title is required.";
  }

  if (!editedCategory.value?.trim()) {
    errors.value.category = "Category is required.";
  }

  // Due date validation
  if (!editedDueDate.value) {
    errors.value.dueDate = "Please select the due date";
  } else {
    const dueDate = parseISO(editedDueDate.value);
    if (isPast(dueDate) && !isToday(dueDate)) {
      errors.value.dueDate = "Due date cannot be in the past";
    }
  }

  return Object.keys(errors.value).length === 0;
};

const startEditing = () => {
  isEditing.value = true;
  editedTitle.value = props.task.title;

  // Improved date handling
  editedDueDate.value = props.task.dueDate
    ? format(props.task.dueDate, "yyyy-MM-dd") // Use date-fns format
    : "";

  editedCategory.value = props.task.category || 'General';
  editedLabels.value = [...(props.task.labels || [])];
};

const saveEdit = () => {
  if (!validate()) return; // Stop if validation fails

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
  errors.value = {}; // Clear errors
};

const deleteTask = () => {
  emit("delete:task", props.task.id);
};

const restoreTask = () => {
  emit("restore:task", props.task.id);
};

const permanentlyDeleteTask = () => {
  emit("permanent:delete", props.task.id);
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
      class: "bg-green-200 text-green-800",
    };
  } else if (isPast(date) && !isToday(date)) {
    return {
      text: `Past due by ${formatDistanceToNow(date)}`,
      class: "bg-red-100 text-red-800",
    };
  } else if (isToday(date)) {
    return {
      text: "Due today",
      class: "bg-yellow-200 text-yellow-900",
    };
  } else {
    return {
      text: `Due in ${formatDistanceToNow(date)}`,
      class: "bg-blue-100 text-blue-800",
    };
  }
});

// Only show due date if not past due
const shouldShowDueDate = computed(() => {
  if (!props.task.dueDate) return false;
  return !isPast(props.task.dueDate) || isToday(props.task.dueDate);
});

const displayCategory = computed(() => {
  // If category exists and is not just whitespace, return it
  // Otherwise, return 'General'
  return props.task.category && props.task.category.trim()
    ? props.task.category
    : 'General';
});
</script>

<template>
  <div class="task-card group p-4 border rounded-lg shadow-sm bg-white">

    <TaskDetailOverlay v-if="showDetails" :show="showDetails" :task="task" @close="showDetails = false"
      @update:task="(updatedTask) => emit('update:task', updatedTask)" @delete:task="(id) => emit('delete:task', id)"
      @restore:task="(id) => emit('restore:task', id)" @permanent:delete="(id) => emit('permanent:delete', id)"
      @edit="startEditing" />

    <div class="flex items-center justify-between gap-4" :class="{
      'opacity-70': task.completed,
      'bg-gray-50': task.deletedAt,
    }">
      <div class="flex items-center flex-1 min-w-0">
        <!-- the !!task.deletedAt is used to convert the value of task.deletedAt to a boolean (true or false).
        The disabled attribute is set to true if the task is deleted (i.e., task.deletedAt is not null or undefined), and the button is disabled.
        If the task is not deleted, the button will be enabled. -->

        <button v-if="!isEditing" @click="toggleComplete"
          class="p-1.5 rounded-full hover:bg-indigo-50 transition-colors shrink-0" :disabled="!!task.deletedAt"
          :class="{ 'opacity-50 cursor-not-allowed': !!task.deletedAt }">
          <CheckCircleIcon class="w-7 h-7 transition-colors"
            :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
        </button>

        <div v-if="!isEditing" class="ml-2 flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span class="text-gray-700 text-lg break-words" :class="{ 'line-through text-gray-400': task.completed }">
              {{ task.title }}
            </span>

            <span class="px-2 py-0.5 rounded-lg bg-slate-200 text-gray-700 text-sm whitespace-nowrap">
              {{ displayCategory }}
            </span>

            <!-- <span v-if="task.category" 
              class="px-2 py-0.5 rounded-lg bg-slate-200 text-gray-700 text-sm whitespace-nowrap">
              {{ task.category }}
            </span> -->
          </div>

          <div class="flex flex-col sm:flex-row flex-wrap items-start gap-3 mt-2">
            <div class="text-sm text-gray-500">
              Created {{ formatDate(new Date(task.createdAt)) }}
            </div>

            <span v-if="task.dueDate && getDueStatus"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 sm:mt-0"
              :class="getDueStatus.class">
              {{ getDueStatus.text }}
            </span>

            <div v-if="shouldShowDueDate" class="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon class="w-4 h-4 shrink-0" />
              <!-- add a non-null assertion operator (!) to tell TypeScript that dueDate is guaranteed to exist when shouldShowDueDate is true. Non-null Assertion (!): By adding task.dueDate!, you assert that dueDate is not undefined in this context. This is safe because the v-if="shouldShowDueDate" condition ensures dueDate exists.-->
              <span>Due Date: {{ formatDate(task.dueDate!) }}</span>
            </div>

            <div v-if="task.deletedAt" class="flex items-center gap-2 text-sm text-red-500">
              <TrashIcon class="w-4 h-4 shrink-0" />
              <span>Deleted: {{ formatDate(task.deletedAt) }}</span>
            </div>
          </div>

          <div v-if="task.labels?.length" class="flex flex-wrap gap-2 mt-2">
            <span v-for="label in task.labels" :key="label"
              class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs">
              {{ label }}
            </span>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="ml-3 flex-1 w-full">
          <div class="space-y-4 w-full">
            <!-- Title Input -->
            <div class="w-full">
              <label for="category" class="block text-gray-700 font-medium mb-1">Edit Task<span
                  class="text-red-500">*</span>
              </label>
              <textarea v-model="editedTitle" @keyup.enter="saveEdit" @keyup.esc="cancelEdit"
                class="w-full p-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                type="text" placeholder="Edit Task..." :class="{ 'border-red-500': errors.title }"></textarea>
              <p v-if="errors.title" class="text-red-500 text-sm">{{ errors.title }}</p>
            </div>

            <!--Due Date and Category Row -->
            <div class="flex flex-col sm:flex-row gap-4 w-full">

              <!-- Due Date Input with Error Handling -->
              <div class="w-full">
                <label for="due-date" class="block text-gray-700 font-medium mb-1">
                  Due Date <span class="text-red-500">*</span>
                </label>

                <div class="relative">
                  <input id="due-date" v-model="editedDueDate" type="date" :min="format(new Date(), 'yyyy-MM-dd')"
                    class="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" :class="{
                      'border-red-500 focus:ring-red-200': errors.dueDate,
                      'border-indigo-300': !errors.dueDate
                    }" required />
                </div>

                <p v-if="errors.dueDate" class="mt-1 text-red-500 text-sm">
                  {{ errors.dueDate }}
                </p>
              </div>

              <!-- Category -->
              <div class="w-full">
                <label for="category" class="block text-gray-700 font-medium mb-1">Category <span
                    class="text-red-500">*</span></label>
                <input v-model="editedCategory" id="category" type="text" placeholder="Category"
                  class="w-full p-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  :class="{ 'border-red-500': errors.category }" />
                <p v-if="errors.category" class="text-red-500 text-sm mt-1">{{ errors.category }}</p>
              </div>
            </div>

            <!-- Labels Section -->
            <div class="space-y-3 w-full">
              <!-- Label -->
              <div class="w-full">
                <label for="new-label" class="block text-gray-700 font-medium mb-1">Label</label>
                <div class="flex flex-col sm:flex-row gap-2 w-full">
                  <input id="new-label" v-model="newLabel" @keyup.enter="addLabel" type="text" placeholder="Add label"
                    class="w-full p-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                  <button @click="addLabel"
                    class="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 whitespace-nowrap">
                    Add Label
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <span v-for="label in editedLabels" :key="label"
                  class="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm">
                  {{ label }}
                  <button @click="removeLabel(label)" class="ml-1.5 text-indigo-500 hover:text-indigo-700">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <button @click="saveEdit"
                class="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <CheckIcon class="w-5 h-5" />
              </button>

              <button @click="cancelEdit" class="p-2 hover:bg-gray-100 rounded-lg border border-gray-400 text-gray-800">
                <XMarkIcon class="w-5 h-5" />
              </button>

            </div>
          </div>
        </div>
      </div>

      <!-- Action Icons -->
      <div class="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <template v-if="!isEditing">
          <template v-if="task.deletedAt">
            <!-- Add to the template, in the actions div before the other buttons -->
            <button @click="showDetails = true" class="btn-secondary p-2" title="View Details">
              <EyeIcon class="w-6 h-6" />
            </button>

            <button @click="restoreTask"
              class="p-2 hover:bg-green-50 rounded-lg border border-gray-400 hover:border-green-300 text-gray-600 hover:text-green-600">
              <ArrowUturnLeftIcon class="w-5 h-5" />
            </button>

            <button @click="permanentlyDeleteTask"
              class="p-2 hover:bg-red-50 rounded-lg border border-gray-400 hover:border-red-200 text-gray-600 hover:text-red-600">
              <TrashIcon class="w-5 h-5" />
            </button>
          </template>

          <template v-else>
            <!-- Add at the end of the template, before the closing div -->
            <template v-if="!isEditing">
              <!-- Add to the template, in the actions div before the other buttons -->
              <button @click="showDetails = true"
                class="p-2.5 hover:bg-blue-50 rounded-lg border border-gray-400 hover:border-blue-200 text-gray-700 hover:text-blue-600"
                title="View Details">
                <EyeIcon class="w-4 h-4" />
              </button>

              <!-- <button @click="viewTask"
                class="p-2 hover:bg-blue-50 rounded-lg border border-gray-400 hover:border-blue-200 text-gray-600 hover:text-blue-600">
                <EyeIcon class="w-5 h-5" />
              </button> 
              -->
            </template>

            <button @click="startEditing"
              class="p-2 hover:bg-indigo-50 rounded-lg border border-gray-400 hover:border-indigo-200 text-gray-600 hover:text-indigo-600"
              title="Edit">
              <PencilIcon class="w-5 h-5" />
            </button>

            <button @click="deleteTask"
              class="p-2 hover:bg-red-50 rounded-lg border border-gray-400 hover:border-red-200 text-gray-600 hover:text-red-600"
              title="Soft Delete">
              <TrashIcon class="w-5 h-5" />
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
