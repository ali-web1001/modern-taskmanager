// types/task.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  deletedAt?: Date;
  labels: string[];
  category?: string;
}

export interface TaskFilter {
  showDeleted: boolean;
  selectedLabels: string[];
  selectedCategory?: string;
  startDate?: string; // Add this
  endDate?: string; // Add this
}

export const TASK_CATEGORIES = [
  "Personal",
  "Work",
  "Shopping",
  "Health",
  "Education",
] as const;

export const TASK_LABELS = [
  "Important",
  "Urgent",
  "In Progress",
  "Blocked",
  "Low Priority",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskLabel = (typeof TASK_LABELS)[number];
