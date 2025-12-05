
import { User, Task, Category } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Manager (Admin)', employeeId: 'ADMIN-001', role: 'ADMIN', avatarColor: 'bg-blue-500' },
  { id: 'u2', name: 'Alex Chen', employeeId: 'ENG-001', role: 'ENGINEER', avatarColor: 'bg-emerald-500' },
  { id: 'u3', name: 'Sarah Lin', employeeId: 'ENG-002', role: 'ENGINEER', avatarColor: 'bg-purple-500' },
  { id: 'u4', name: 'Mike Wang', employeeId: 'ENG-003', role: 'ENGINEER', avatarColor: 'bg-orange-500' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: '機構設計 (ME)' },
  { id: 'c2', name: '電子電路 (EE)' },
  { id: 'c3', name: '文件/行政 (Doc)' },
  { id: 'c4', name: '會議 (Meeting)' },
  { id: 'c5', name: '測試驗證 (Test)' }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    userId: 'u2',
    title: 'Type-C Gen3 設計初稿',
    description: '完成 Pin 腳定義與初步 3D 堆疊，需確認阻抗匹配。',
    receiveDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    estimatedHours: 16,
    actualHours: 4,
    status: 'IN_PROGRESS',
    logs: [
      { id: 'l1', date: new Date().toISOString().split('T')[0], content: '完成 Pin 定義', hoursSpent: 4 }
    ],
    priority: 'HIGH',
    phase: 'DESIGN',
    categoryId: 'c1'
  },
  {
    id: 't2',
    userId: 'u3',
    title: '模具公差分析報告',
    description: '針對上週試模結果進行公差檢討，確認 Cpk 值。',
    receiveDate: new Date().toISOString().split('T')[0],
    deadline: new Date().toISOString().split('T')[0],
    estimatedHours: 4,
    actualHours: 0,
    status: 'TODO',
    logs: [],
    priority: 'MEDIUM',
    phase: 'TOOLING',
    categoryId: 'c5'
  }
];

export const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 
  'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500'
];
