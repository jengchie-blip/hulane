import { TaskStatus, TaskPriority, ProjectPhase } from './types';
import { AVATAR_COLORS } from './constants';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRandomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

export const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'TODO': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PAUSED': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'REVIEW': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'DONE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-gray-100';
  }
};

export const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'TODO': return '待處理';
    case 'IN_PROGRESS': return '進行中';
    case 'PAUSED': return '暫停中';
    case 'REVIEW': return '審核中';
    case 'DONE': return '已完成';
    default: return status;
  }
};

export const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
    case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'LOW': return 'text-slate-600 bg-slate-50 border-slate-100';
  }
};

export const getPhaseLabel = (phase: ProjectPhase) => {
  switch (phase) {
    case 'RFQ': return 'RFQ/概念';
    case 'DESIGN': return '產品設計';
    case 'TOOLING': return '模具/製程';
    case 'VALIDATION': return 'DV/PV驗證';
    case 'SOP': return '量產導入';
  }
};