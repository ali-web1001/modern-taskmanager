<template>
    <div class="min-h-screen bg-indigo-100 dark:bg-gray-950 py-12 px-4 sm:px-6">
        <div class="max-w-7xl mx-auto pt-16 sm:pt-20 pb-9 px-2 sm:px-6">
            <Header />
            <!-- Back Button -->
            <div class="mb-6">
                <button @click="router.push('/')" class="flex items-center text-indigo-600 hover:text-indigo-700">
                    <ArrowLeftIcon class="w-5 h-5 mr-2" />
                    Back
                </button>
            </div>

            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-200">Admin Dashboard</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-300">Manage users and roles</p>
            </div>

            <!-- Loading State -->
            <LoadingComponent v-if="adminStore.loading" />

            <!-- Error State -->
            <div v-else-if="adminStore.error" class="bg-red-50 p-4 rounded-lg">
                <p class="text-red-700">{{ adminStore.error }}</p>
            </div>

            <!-- Users Table -->
            <div v-else class="space-y-6">
                <div class="shadow-md rounded-lg overflow-hidden overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">

                        <thead class="bg-gray-100 dark:bg-gray-900">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    User</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Email</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Role</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Joined</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions</th>
                            </tr>
                        </thead>

                        <tbody class="bg-gray-50 dark:bg-gray-900 divide-y divide-gray-200">
                            <tr v-for="user in adminStore.users" :key="user.id">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="h-10 w-10 flex-shrink-0">
                                            <img v-if="user.user_metadata?.avatar_url"
                                                :src="user.user_metadata.avatar_url"
                                                :alt="user.user_metadata?.name || 'User avatar'"
                                                class="h-10 w-10 rounded-full" />
                                            <div v-else
                                                class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span class="text-indigo-600 font-medium">
                                                    {{ (user.user_metadata?.name || user.email)[0].toUpperCase() }}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {{ user.user_metadata?.name || 'No name' }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-600 dark:text-gray-300">{{ user.email }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span v-if="user.role" :class="[
                                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    ]">
                                        {{ user.role }}
                                    </span>
                                    <span v-else class="text-gray-600 dark:text-gray-300 text-sm">No role</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {{ new Date(user.created_at).toLocaleDateString() }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <div class="flex items-center gap-2">
                                        <!-- Role Selection - Disabled for current admin -->
                                        <select v-model="selectedRoles[user.id]" @change="handleRoleChange(user.id)"
                                            :disabled="user.id === currentUserId"
                                            class="text-sm bg-gray-100 dark:bg-indigo-300 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                            <option value="">No role</option>
                                            <option value="admin">Admin</option>
                                            <option value="admin">Editor</option>
                                        </select>

                                        <!-- View User Tasks Button -->
                                        <button @click="viewUserTasks(user.id)"
                                            class="p-2 text-blue-600 hover:text-blue-800 rounded-lg" title="View Tasks">
                                            <ClipboardDocumentListIcon class="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- User Tasks Modal -->
                <TransitionRoot appear :show="isTaskModalOpen" as="template">
                    <Dialog as="div" @close="closeTaskModal" class="relative z-50">
                        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />

                        <div class="fixed inset-0 overflow-y-auto">
                            <div class="flex min-h-full items-center justify-center p-4">
                                <DialogPanel class="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
                                    <DialogTitle class="text-lg font-medium mb-4">
                                        Tasks for {{ selectedUserEmail }}
                                    </DialogTitle>

                                    <div class="space-y-4">
                                        <div v-if="userTasks.length === 0" class="text-gray-500 text-center py-4">
                                            No tasks found for this user
                                        </div>
                                        <div v-else class="space-y-2">
                                            <div v-for="task in userTasks" :key="task.id"
                                                class="p-4 border rounded-lg hover:bg-gray-50">
                                                <div class="flex items-center justify-between">
                                                    <div>
                                                        <h3 class="font-medium"
                                                            :class="{ 'line-through': task.completed }">
                                                            {{ task.title }}
                                                        </h3>
                                                        <div class="text-sm text-gray-500 mt-1">
                                                            Due: {{ task.dueDate ? new
                                                                Date(task.dueDate).toLocaleDateString() : 'No due date' }}
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <button @click="toggleTaskComplete(task)"
                                                            class="text-green-600 hover:text-green-800"
                                                            title="Toggle Complete">
                                                            <CheckCircleIcon class="w-5 h-5"
                                                                :class="{ 'text-green-500': task.completed }" />
                                                        </button>
                                                        <button @click="deleteUserTask(task.id)"
                                                            class="text-red-600 hover:text-red-800" title="Delete Task">
                                                            <TrashIcon class="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-6 flex justify-end">
                                        <button @click="closeTaskModal"
                                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                            Close
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                </TransitionRoot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../stores/admin';
import type { UserRole } from '../types/roles';
import type { Task } from '../types/task';
import LoadingComponent from '../components/LoadingComponent.vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot } from '@headlessui/vue';
import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    TrashIcon
} from '@heroicons/vue/24/outline';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import Header from '../components/Header.vue';

const router = useRouter();
const adminStore = useAdminStore();
const selectedRoles = ref<Record<string, UserRole | ''>>({});
const currentUserId = ref<string | null>(null);
const authStore = useAuthStore();
// Task management
const isTaskModalOpen = ref(false);
const selectedUserEmail = ref('');
const userTasks = ref<Task[]>([]);
const selectedUserId = ref<string | null>(null);

onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId.value = user?.id || null;

    await adminStore.fetchUsers();
    // Initialize selected roles from current user roles
    adminStore.users.forEach(user => {
        selectedRoles.value[user.id] = user.role || '';
    });
});

const handleRoleChange = async (userId: string) => {
    const newRole = selectedRoles.value[userId];
    try {
        if (newRole) {
            await adminStore.assignRole(userId, newRole as UserRole);
        } else {
            await adminStore.removeRole(userId);
        }
    } catch (error) {
        // Reset selection on error
        selectedRoles.value[userId] = adminStore.users.find(u => u.id === userId)?.role || '';
    }
};

const viewUserTasks = async (userId: string) => {
    try {
        const user = adminStore.users.find(u => u.id === userId);
        if (!user) return;

        selectedUserId.value = userId;
        selectedUserEmail.value = user.email;

        // Get the current user from auth store
        const currentUser = authStore.user;
        if (!currentUser) {
            throw new Error('No authenticated user found');
        }
        // First check if current user is admin or editor
        const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single();

        if (roleError) throw roleError;

        const isAdminOrEditor = userRole?.role === 'admin' || userRole?.role === 'editor';

        // Fetch tasks based on privileges
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', isAdminOrEditor ? userId : currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        userTasks.value = tasks.map(task => ({
            ...task,
            createdAt: new Date(task.created_at),
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            deletedAt: task.deleted_at ? new Date(task.deleted_at) : undefined,
            labels: task.labels || []
        }));

        isTaskModalOpen.value = true;
    } catch (error) {
        console.error('Failed to fetch user tasks:', error);
    }
};

const toggleTaskComplete = async (task: Task) => {
    try {
        const { error } = await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', task.id);

        if (error) throw error;

        // Update local state
        task.completed = !task.completed;
    } catch (error) {
        console.error('Failed to update task:', error);
    }
};

const deleteUserTask = async (taskId: string) => {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;

        // Update local state
        userTasks.value = userTasks.value.filter(t => t.id !== taskId);
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
};

const closeTaskModal = () => {
    isTaskModalOpen.value = false;
    selectedUserId.value = null;
    selectedUserEmail.value = '';
    userTasks.value = [];
};
</script>