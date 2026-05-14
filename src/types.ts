export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  leadId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: Priority;
  assignedTo: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'AI ANALYZING' | 'CALLING' | 'COMPLETED' | 'PENDING';
  priority: Priority;
  industry: string;
  website: string;
  phone?: string;
  dateAdded: string;
  avatar: string;
}
