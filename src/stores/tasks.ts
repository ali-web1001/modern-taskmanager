import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";
import type { Task } from "../types/task";
import type { Database } from "../types/supabase";
import { useAuthStore } from "./auth";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

const toast = useToast();

type DbTask = Database["public"]["Tables"]["tasks"]["Row"];

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

export const useTaskStore = defineStore("tasks", {
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
    getDeletedTasks: (state) => state.tasks.filter((task) => task.deletedAt),
    getActiveTasks: (state) => state.tasks.filter((task) => !task.deletedAt),
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
        .channel("tasks-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newTask = mapDbTaskToTask(payload.new as DbTask);
              this.tasks.unshift(newTask);
            } else if (payload.eventType === "UPDATE") {
              const updatedTask = mapDbTaskToTask(payload.new as DbTask);
              const index = this.tasks.findIndex(
                (t) => t.id === updatedTask.id
              );
              //.findIndex() searches this.tasks to find a task that matches the updated task's ID.
              // It returns the index of the found task.
              // If no task is found, it returns -1.
              // Replacing the old task with the updated one
              // if (index !== -1) this.tasks[index] = updatedTask;
              // If a task was found (index !== -1), it replaces the old task with the updated task.
              // This ensures that our UI reflects the latest changes from the database.
              if (index !== -1) this.tasks[index] = updatedTask;
            } else if (payload.eventType === "DELETE") {
              // payload.old contains the deleted row’s data before it was removed from the database.
              // (payload.old as DbTask).id extracts the ID of the deleted task.
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
          .from("tasks")
          .select("*")
          .eq("user_id", authStore.user.id)
          .order("deleted_at", { ascending: true, nullsFirst: true })
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.tasks = (data || []).map(mapDbTaskToTask);

        // Setup real-time subscription with the same filters
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
        if (!authStore.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("tasks")
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

        toast.success("Task Added Successfully!");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to add the task!");
        throw error;
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .update({
            title: updates.title,
            completed: updates.completed,
            due_date: updates.dueDate?.toISOString(),
            deleted_at: updates.deletedAt?.toISOString(),
            category: updates.category,
            labels: updates.labels,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
        // Toast success message
        toast.success("Task updated successfully!");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to update the task!");
        throw error;
      }
    },

    async deleteTask(id: string) {
      try {
        // Soft delete: update the task with a deleted_at timestamp
        const { data, error } = await supabase
          .from("tasks")
          .update({
            deleted_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update: update the local task state
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
        // Toast success message
        toast.success("Task deleted temporarily!");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to delete the task!");
        throw error;
      }
    },

    async restoreTask(id: string) {
      try {
        // Restore the task by removing the deleted_at timestamp
        const { data, error } = await supabase
          .from("tasks")
          .update({
            deleted_at: null,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        // Optimistic update: update the local task state
        const updatedTask = mapDbTaskToTask(data as DbTask);
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) this.tasks[index] = updatedTask;
        // Toast success message
        toast.success("Task restored successfully!");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to restore task!");
        throw error;
      }
    },

    async permanentlyDeleteTask(id: string) {
      try {
        // Show confirmation dialog
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "This will permanently delete the task!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        // Permanently remove the task from the database
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) throw error;
        // Optimistic update: remove the task from local state
        this.tasks = this.tasks.filter((t) => t.id !== id);
        // Toast success message
        toast.success("Task permanently deleted!");
      } catch (error: any) {
        this.error = error.message;
        toast.error("Failed to permanently delete the task!");
        throw error;
      }
    },
  },
});
