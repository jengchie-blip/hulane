
import React, { useState, useEffect } from 'react';
import { Briefcase, ChevronRight, LogOut, CheckCircle2, LayoutDashboard, Badge } from 'lucide-react';
import { User, Task, TaskLog, Category } from './types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_CATEGORIES } from './constants';
import { generateId, getRandomColor } from './utils';
import { ConfirmModal } from './components/Shared';
import AdminDashboard from './components/AdminDashboard';
import EngineerDashboard from './components/EngineerDashboard';

const App = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('connector_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic migration check (if old data structure)
      if (parsed.length > 0 && parsed[0].email) {
        return parsed.map((u: any) => ({
          ...u,
          employeeId: u.email.split('@')[0],
          email: undefined 
        }));
      }
      return parsed;
    }
    return INITIAL_USERS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('connector_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('connector_tasks');
    let parsedTasks: Task[] = saved ? JSON.parse(saved) : INITIAL_TASKS;
    
    // Migration: If task has no categoryId, assign the first available category
    const defaultCatId = INITIAL_CATEGORIES[0].id;
    parsedTasks = parsedTasks.map(t => {
       if (!t.categoryId) {
         return { ...t, categoryId: defaultCatId };
       }
       return t;
    });
    
    return parsedTasks;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingImportData, setPendingImportData] = useState<{users: User[], tasks: Task[]} | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('connector_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('connector_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('connector_categories', JSON.stringify(categories));
  }, [categories]);

  // --- Actions ---

  const handleAddUser = (userData: Omit<User, 'id' | 'avatarColor'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      avatarColor: getRandomColor()
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleAddCategory = (name: string) => {
    const newCat: Category = {
      id: generateId(),
      name
    };
    setCategories([...categories, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleAddTask = (taskData: any) => {
    if (!currentUser) return;
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      userId: taskData.userId || currentUser.id, // Use provided userId (Admin assignment) or current user
      status: 'TODO',
      logs: [],
      actualHours: 0
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  }

  const handleTransferTask = (taskId: string, newUserId: string, fromUserId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { 
      ...t, 
      userId: newUserId,
      transferredFrom: fromUserId 
    } : t));
  };

  const handleDismissAlert = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, transferredFrom: undefined } : t));
  };

  const handleAddLog = (taskId: string, logData: { content: string, hoursSpent: number }) => {
    const newLog: TaskLog = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      ...logData
    };
    
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        // If adding log and task is not started/in_progress, start it and set startDate
        const updates: Partial<Task> = {
          actualHours: t.actualHours + logData.hoursSpent,
          logs: [newLog, ...t.logs],
          status: 'IN_PROGRESS' 
        };
        
        if (!t.startDate) {
            updates.startDate = new Date().toISOString().split('T')[0];
        }
        
        return {
          ...t,
          ...updates
        };
      }
      return t;
    }));
  };

  // --- Export / Import Logic ---
  
  const handleExportData = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      users,
      tasks
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connector_sync_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (!parsed.users || !parsed.tasks) {
          alert("錯誤：檔案格式不正確");
          return;
        }
        
        setPendingImportData({ users: parsed.users, tasks: parsed.tasks });
      } catch (err) {
        alert("錯誤：無法解析檔案");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImportData) {
      setUsers(pendingImportData.users);
      setTasks(pendingImportData.tasks);
      setPendingImportData(null);
      alert("資料匯入成功！");
    }
  };

  // --- View: Login Screen ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Briefcase className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connector Sync</h1>
          <p className="text-slate-500 mb-8">請選擇您的身份登入系統</p>
          
          <div className="space-y-3">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full flex items-center p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.avatarColor} mr-4`}>
                  {user.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-slate-900 group-hover:text-blue-700">{user.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Badge className="w-3 h-3" /> {user.employeeId} • {user.role === 'ADMIN' ? '管理員' : '工程師'}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- View: Main Application ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-64 border-b md:border-r border-slate-200 flex-shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">Sync</span>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
          <button 
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentUser.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            disabled={currentUser.role !== 'ADMIN'}
            onClick={() => {/* Navigation placeholder */}}
          >
            <LayoutDashboard className="w-4 h-4" /> 總覽儀表板
          </button>
          <button 
             className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentUser.role === 'ENGINEER' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
             disabled={currentUser.role !== 'ENGINEER'}
             onClick={() => {/* Navigation placeholder */}}
          >
            <CheckCircle2 className="w-4 h-4" /> 我的任務
          </button>
        </div>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${currentUser.avatarColor}`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-500 truncate">{currentUser.employeeId}</div>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> 登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {currentUser.role === 'ADMIN' ? (
            <AdminDashboard 
              users={users} 
              tasks={tasks}
              categories={categories}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onRemoveUser={handleRemoveUser}
              onImportData={handleImportData}
              onExportData={handleExportData}
              onTransferTask={handleTransferTask}
              onDismissAlert={handleDismissAlert}
              onAddTask={handleAddTask}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          ) : (
            <EngineerDashboard 
              user={currentUser} 
              tasks={tasks} 
              users={users}
              categories={categories}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onAddLog={handleAddLog}
              onDeleteTask={handleDeleteTask}
              onTransferTask={handleTransferTask}
              onDismissAlert={handleDismissAlert}
            />
          )}
        </div>
      </main>

       <ConfirmModal 
        isOpen={!!pendingImportData}
        onClose={() => setPendingImportData(null)}
        onConfirm={confirmImport}
        title="確認匯入資料"
        message={
          <div className="space-y-2">
            <p>您即將匯入新的資料檔案。這將會：</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li><strong>覆蓋</strong> 目前系統中所有的成員與任務資料。</li>
              <li>若是從雲端硬碟讀取，這將同步成最新的版本。</li>
            </ul>
            <p className="font-bold text-slate-800 mt-2">請確認您已備份目前的資料，或確定要執行此操作？</p>
          </div>
        }
        confirmText="確認覆蓋匯入"
        isDanger={true}
      />
    </div>
  );
};

export default App;
