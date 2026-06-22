export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface UserTask {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt?: string;
  updatedAt?: string;
}