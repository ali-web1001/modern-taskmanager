import { ArrowDownIcon, BugAntIcon } from "@heroicons/vue/24/outline";
import {
  FireIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
} from "@heroicons/vue/24/outline";

// types/task.ts
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  deletedAt?: Date | null;
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
  { name: "Urgent", icon: FireIcon },
  { name: "Completed", icon: CheckIcon },
  { name: "Important", icon: StarIcon },
  { name: "In Progress", icon: ClockIcon },
  { name: "Pending", icon: ClockIcon },
  { name: "Blocked", icon: BugAntIcon },
  { name: "Low Priority", icon: ArrowDownIcon },
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskLabel = (typeof TASK_LABELS)[number];
