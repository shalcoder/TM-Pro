import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, ClipboardList, 
  Plus, Search, LogOut, Calendar, 
  CheckCircle2, Circle, Clock, Trash2, 
  ChevronRight, Inbox, Bell, Hash,
  Zap, AlertCircle, Layers, Settings
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import Analytics from './Analytics';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' });
  
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'board') {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } else if (activeTab === 'logs') {
        const res = await api.get('/tasks/audit');
        setLogs(res.data);
      }
    } catch {
      toast.error('Sync failed. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
      setShowForm(false);
      loadData();
      toast.success('Task deployed to workspace');
    } catch {
      toast.error('Deployment failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      loadData();
      toast.success(`Moved to ${status}`);
    } catch {
      toast.error('Sync error');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Archive this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      loadData();
      toast.success('Task archived');
    } catch {
      toast.error('Archive failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'BACKLOG', title: 'Backlog', icon: <Hash size={14} />, color: '#71717a' },
    { id: 'PENDING', title: 'To Do', icon: <Circle size={14} />, color: '#6366f1' },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: <Clock size={14} />, color: '#f59e0b' },
    { id: 'REVIEW', title: 'Review', icon: <Layers size={14} />, color: '#8b5cf6' },
    { id: 'COMPLETED', title: 'Done', icon: <CheckCircle2 size={14} />, color: '#10b981' }
  ];

  const StatBox = ({ label, value, icon, color }) => (
    <div className="glass-card p-4 flex items-center gap-4 flex-1">
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-dark">
      <Toaster position="bottom-right" />
      
      {/* Navigation Sidebar */}
      <aside className="w-64 bg-dark-surface border-r border-border-subtle flex flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter">TM PRO</span>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3 px-3">General</div>
          {[
            { id: 'board', label: 'Workspace', icon: <LayoutDashboard size={18} /> },
            { id: 'stats', label: 'Analytics', icon: <BarChart3 size={18} /> },
            { id: 'logs', label: 'Audit Trail', icon: <ClipboardList size={18} />, admin: true },
          ].map(item => (
            (!item.admin || user.role === 'ADMIN') && (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full nav-item-pro ${activeTab === item.id ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {item.icon} {item.label}
              </button>
            )
          ))}
          <div className="pt-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3 px-3">System</div>
            <button className="w-full nav-item-pro text-zinc-500 hover:text-zinc-300"><Settings size={18} /> Settings</button>
            <button className="w-full nav-item-pro text-zinc-500 hover:text-zinc-300"><AlertCircle size={18} /> Help Center</button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-border-subtle">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 text-xs">
              {user.email[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold truncate">{user.email.split('@')[0]}</p>
              <p className="text-[9px] uppercase tracking-tighter text-zinc-600 font-black">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-red-500/70 hover:text-red-500 text-[11px] font-bold transition-colors">
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* Content Engine */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 linear-border bg-dark-surface/50 backdrop-blur-md px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                placeholder="Search projects, tasks, logs..." 
                className="w-full bg-transparent border-none text-[13px] outline-none pl-10 text-zinc-300 placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-zinc-500 hover:text-zinc-300 relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-dark" />
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary py-1.5 px-4 rounded-lg flex items-center gap-2 text-xs">
              <Plus size={14} /> New Task
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.05),_transparent)]">
          {/* Summary Bar */}
          <div className="flex gap-6 mb-10">
            <StatBox label="Active Tasks" value={tasks.length} icon={<Layers size={18} />} color="indigo" />
            <StatBox label="Resolved" value={tasks.filter(t => t.status === 'COMPLETED').length} icon={<CheckCircle2 size={18} />} color="emerald" />
            <StatBox label="High Priority" value={tasks.filter(t => t.priority === 'HIGH').length} icon={<AlertCircle size={18} />} color="amber" />
            <StatBox label="Organization" value={user.organizationName || 'Personal'} icon={<Zap size={18} />} color="indigo" />
          </div>

          {loading ? (
            <div className="grid grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-4">
                  <div className="h-4 w-24 skeleton-box mb-6" />
                  <div className="h-32 glass-card skeleton-box" />
                  <div className="h-32 glass-card skeleton-box" />
                </div>
              ))}
            </div>
          ) : activeTab === 'stats' ? (
            <Analytics />
          ) : activeTab === 'logs' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/2 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-600">Identity</th>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-600">Action</th>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-600">Context</th>
                    <th className="px-6 py-4 font-black uppercase tracking-widest text-zinc-600 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/2">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-300">{log.user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`stat-badge ${log.action.includes('DELETED') ? 'border-red-500/20 text-red-400' : 'border-indigo-500/20 text-indigo-400'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono italic max-w-xs truncate">{log.oldValue || log.newValue}</td>
                      <td className="px-6 py-4 text-right text-zinc-600">{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="flex gap-6 min-h-0 h-full overflow-x-auto pb-4">
              {columns.map(col => (
                <div key={col.id} className="flex flex-col gap-4 w-72 min-w-[18rem]">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white/5 text-zinc-400">
                        {col.icon}
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                        {col.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {filteredTasks.filter(t => t.status === col.id).map(task => (
                      <motion.div 
                        layout
                        key={task.id} 
                        className="glass-card p-4 group hover:ring-1 hover:ring-indigo-500/30 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`stat-badge ${task.priority === 'HIGH' ? 'border-amber-500/20 text-amber-500' : 'border-zinc-500/20 text-zinc-500'}`}>
                            {task.priority}
                          </span>
                          <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="text-[13px] font-semibold leading-snug mb-1 group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                          {task.description || 'No detailed briefing provided.'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                            <Calendar size={10} />
                            {format(new Date(task.createdAt), 'MMM dd')}
                          </div>
                          <select 
                            value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value)}
                            className="bg-transparent text-[9px] font-black text-indigo-400 uppercase tracking-tighter outline-none cursor-pointer"
                          >
                            {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                          </select>
                        </div>
                      </motion.div>
                    ))}
                    {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                      <div className="border border-dashed border-white/5 rounded-xl h-24 flex items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        Empty Sector
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deploy Task Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-lg p-10 bg-dark-card">
                <h3 className="text-2xl font-black mb-8 tracking-tighter flex items-center gap-3">
                  <Zap size={24} className="text-indigo-500" /> New Operation
                </h3>
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operation Title</label>
                    <input className="input-field bg-white/2" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="e.g., Deploy core infrastructure" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Priority Protocol</label>
                    <select className="input-field bg-white/2" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="LOW">Low Impact</option>
                      <option value="MEDIUM">Standard</option>
                      <option value="HIGH">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Briefing Details</label>
                    <textarea className="input-field bg-white/2" rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} placeholder="Describe the mission objectives..." />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="btn-primary flex-1 py-3 text-xs">Deploy Task</button>
                    <button type="button" onClick={() => setShowForm(false)} className="bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl flex-1 py-3 text-xs transition-all">Abort</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
