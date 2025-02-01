<template>
    <!-- Modal -->
    <Transition enter-active-class="ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">

        <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" @click="close">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div class="flex min-h-screen items-center justify-center p-2 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6"
                    @click.stop>
                    <!-- Close button -->
                    <button @click="close"
                        class="absolute right-5 top-4 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:rounded focus:ring-indigo-500">
                        <XMarkIcon class="h-6 w-6" />
                    </button>

                    <!-- Task Details -->
                    <div class="px-5 py-5">
                        <div class="space-y-4">
                            <div>
                                <div class="flex items-center">
                                    <!-- <button @click="toggleComplete"
                                        class="p-1.5 rounded-full hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <CheckCircleIcon class="w-8 h-8 transition-colors"
                                            :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
                                    </button> -->
                                    <h3 class="text-xl font-semibold text-gray-900"
                                        :class="{ 'line-through': task.completed }">
                                        {{ task.title }}
                                    </h3>
                                </div>

                                <!-- Category -->
                                <div v-if="task.category" class="mt-3">
                                    <span class="px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-sm">
                                        Category : {{ task.category }}
                                    </span>
                                </div>
                            </div>

                            <!-- Dates -->
                            <div class="space-y-3">
                                <div class="flex items-center gap-2 text-sm text-gray-600">
                                    <CalendarIcon class="w-5 h-5" />
                                    <span>Created: {{ formatDate(new Date(task.createdAt)) }}</span>
                                </div>

                                <div v-if="task.dueDate" class="flex items-center gap-2">
                                    <div class="flex items-center gap-2 text-sm" :class="getDueStatusColor">
                                        <ClockIcon class="w-5 h-5" />
                                        <span>{{ getDueStatusText }}</span>
                                    </div>
                                </div>

                                <!-- Labels -->
                                <div v-if="task.labels?.length" class="flex flex-wrap gap-2">
                                    <span v-for="label in task.labels" :key="label"
                                        class="px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-sm">
                                        Label :- {{ label }}
                                    </span>
                                </div>

                                <div v-if="task.deletedAt" class="flex items-center gap-2 text-sm text-red-600">
                                    <TrashIcon class="w-5 h-5" />
                                    <span>Deleted: {{ formatDate(new Date(task.deletedAt)) }}</span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="mt-6 flex justify-end gap-3">
                                <template v-if="task.deletedAt">
                                    <button @click="restore"
                                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <ArrowUturnLeftIcon class="w-5 h-5 mr-2" />
                                        Restore
                                    </button>
                                    <button @click="permanentlyDelete"
                                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <TrashIcon class="w-5 h-5 mr-2" />
                                        Delete Permanently
                                    </button>
                                </template>

                                <!-- <template v-else>
                                    <button @click="edit"
                                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <PencilIcon class="w-5 h-5 mr-2" />
                                        Edit
                                    </button>
                                    <button @click="deleteTask"
                                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <TrashIcon class="w-5 h-5 mr-2" />
                                        Delete
                                    </button>
                                </template> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format, isPast, isToday, formatDistanceToNow } from 'date-fns';
import {
    XMarkIcon,
    // CheckCircleIcon,
    CalendarIcon,
    ClockIcon,
    TrashIcon,
    // PencilIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/vue/24/outline';
import type { Task } from '../types/task';

const props = defineProps<{
    show: boolean;
    task: Task;
}>();
// Add ref for modal content
// const modalContent = ref<HTMLElement | null>(null);
const emit = defineEmits<{
    'close': [];
    'update:task': [task: Task];
    'delete:task': [id: string];
    'restore:task': [id: string];
    'permanent:delete': [id: string];
    'edit': [];
}>();

const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy h:mm a');
};

const getDueStatusText = computed(() => {
    if (!props.task.dueDate) return '';

    const date = props.task.dueDate;

    if (props.task.completed) {
        return 'Completed';
    } else if (isPast(date) && !isToday(date)) {
        return `Past due by ${formatDistanceToNow(date)}`;
    } else if (isToday(date)) {
        return 'Due today';
    } else {
        return `Due in ${formatDistanceToNow(date)}`;
    }
});

const getDueStatusColor = computed(() => {
    if (!props.task.dueDate) return '';

    if (props.task.completed) {
        return 'text-green-600';
    } else if (isPast(props.task.dueDate) && !isToday(props.task.dueDate)) {
        return 'text-red-600';
    } else if (isToday(props.task.dueDate)) {
        return 'text-yellow-600';
    }
    return 'text-blue-600';
});

const close = () => {
    emit('close');
};

// const toggleComplete = () => {
//     emit('update:task', {
//         ...props.task,
//         completed: !props.task.completed,
//     });
// };

// const deleteTask = () => {
//     emit('delete:task', props.task.id);
//     close();
// };

const restore = () => {
    emit('restore:task', props.task.id);
    close();
};

const permanentlyDelete = () => {
    emit('permanent:delete', props.task.id);
    close();
};

// const edit = () => {
//     emit('edit');
//     close();
// };
</script>