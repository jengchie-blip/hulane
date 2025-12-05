
export type Role = 'ADMIN' | 'ENGINEER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'PAUSED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ProjectPhase = 'RFQ' | 'DESIGN' | 'TOOLING' | 'VALIDATION' | 'SOP';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  role: Role;
  avatarColor: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface TaskLog {
  id: string;
  date: string;
  content: string;
  hoursSpent: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  receiveDate: string;
  deadline: string;
  startDate?: string;
  estimatedHours: number;
  actualHours: number;
  status: TaskStatus;
  completedDate?: string;
  logs: TaskLog[];
  priority: TaskPriority;
  phase: ProjectPhase;
  categoryId: string;
  transferredFrom?: string;
}

export interface NotificationItem {
  id: string;
  type: 'OVERDUE' | 'DUE_SOON' | 'REVIEW_NEEDED' | 'TRANSFER_RECEIVED';
  message: string;
  taskId: string;
  userName?: string;
  action?: () => void;
}
