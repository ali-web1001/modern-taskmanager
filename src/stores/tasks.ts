import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/task';
import type { Database } from '../types/supabase';
import { useAuthStore } from './auth';

type DbTask = Database['public']['Tables']['tasks']['Row'];

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  subscription: any; // To manage real-time subscription
}

const mapDbTaskToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  completed: dbTask.completed,
  createdAt: new Date(dbTask.created_at),
  dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
  deletedAt: dbTask.deleted_at ? new Date(dbTask.deleted_at) : undefined,
  labels: dbTask.labels || [],
  category: dbTask.category || undefined,
});

export const useTaskStore = defineStore('tasks', {
  state: (): TaskState => ({
    tasks: [],
    loading: false,
    error: null,
    subscription: null,
  }),

  getters: {
    getTasks: (state) => state.tasks,
    getTaskById: (state) => (id: string) =>
      state.tasks.find((task) => task.id === id),
  },

  actions: {
    async setupRealtimeSubscription() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      const userId = authStore.user.id;

      // Remove existing subscription
      if (this.subscription) {
        supabase.removeChannel(this.subscription);
        this.subscription = null;
      }

      this.subscription = supabase
        .channel('tasks-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newTask = mapDbTaskToTask(payload.new as DbTask);
              // Check if task already exists to prevent duplicates
              const existingTaskIndex = this.tasks.findIndex(t => t.id === newTask.id);
              if (existingTaskIndex === -1) {
                this.tasks.unshift(newTask);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedTask = mapDbTaskToTask(payload.new as DbTask);
              const index = this.tasks.findIndex(
                (t) => t.id === updatedTask.id
              );
              if (index !== -1) this.tasks[index] = updatedTask;
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as DbTask).id;
              this.tasks = this.tasks.filter((t) => t.id !== deletedId);
            }
          }
        )
        .subscribe();
    },

    async fetchTasks() {
      try {
        const authStore = useAuthStore();
        if (!authStore.user) return;

        this.loading = true;
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.tasks = (data || []).map(mapDbTaskToTask);

        // Setup real-time subscription
        await this.setupRealtimeSubscription();
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createTask(task: Partial<Task>) {
      try {
        const authStore = useAuthStore();
        if (!authStore.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: task.title,
            completed: task.completed || false,
            due_date: task.dueDate?.toISOString(),
            category: task.category,
            labels: task.labels || [],
            user_id: authStore.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        const newTask = mapDbTaskToTask(data as DbTask);
        this.tasks.unshift(newTask); // Optimistic update
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: updates.title,
            completed: updates.completed,
            due_date: updates.dueDate?.toISOString(),
            deleted_at: updates.deletedAt?.toISOString(),
            category: updates.category,
            labels: updates.labels,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async deleteTask(id: string) {
      try {
        // Soft delete: update the task with a deleted_at timestamp
        const { data, error } = await supabase
          .from('tasks')
          .update({
            deleted_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update: update the local task state
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async restoreTask(id: string) {
      try {
        // Restore the task by removing the deleted_at timestamp
        const { data, error } = await supabase
          .from('tasks')
          .update({
            deleted_at: null
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update: update the local task state
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async permanentlyDeleteTask(id: string) {
      try {
        // Permanently remove the task from the database
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Optimistic update: remove the task from local state
        this.tasks = this.tasks.filter((t) => t.id !== id);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },
  },
});
