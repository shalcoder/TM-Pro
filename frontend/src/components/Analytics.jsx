import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Activity, Clock, TrendingUp, Filter, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/tasks/stats');
        setStats(statsRes.data);
        
        const logsRes = await api.get('/tasks/audit');
        setActivity(logsRes.data.slice(0, 10)); // Top 10 activities
      } catch {
        // Fallback mock data for empty state
        setStats({
          total: 42,
          statusStats: [
            { name: 'Todo', value: 12 },
            { name: 'In Progress', value: 15 },
            { name: 'Done', value: 15 }
          ],
          priorityStats: [
            { name: 'High', value: 8 },
            { name: 'Medium', value: 20 },
            { name: 'Low', value: 14 }
          ]
        });
      }
    };
    fetchData();
  }, []);

  // Mock data for the AreaChart (Velocity)
  const velocityData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 7 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 12 },
    { name: 'Fri', completed: 8 },
    { name: 'Sat', completed: 3 },
    { name: 'Sun', completed: 9 },
  ];

  if (!stats) return <div className="p-20 text-center animate-pulse text-zinc-500">Initializing analytical engine...</div>;

  return (
    <div className="space-y-8 fade-in">
      {/* Header Filters */}
      <div className="flex justify-between items-center bg-dark-card/30 p-2 rounded-xl border border-white/5">
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'All'].map(range => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-zinc-100 text-dark' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-3 py-1.5 border border-white/5 rounded-lg">
          <Filter size={14} /> Advanced Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Velocity Chart */}
        <div className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" /> Task Velocity
              </h3>
              <p className="text-xs text-zinc-500">Throughput of resolved tasks over time</p>
            </div>
            <button className="text-zinc-600 hover:text-zinc-400"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#121214', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" /> Recent Activity
          </h3>
          <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2">
            {activity.length > 0 ? activity.map(log => (
              <div key={log.id} className="flex gap-4 group">
                <div className="w-1 h-auto bg-white/5 rounded-full group-hover:bg-indigo-500/30 transition-colors" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-300">
                    <span className="text-indigo-400">{log.user.email.split('@')[0]}</span> {log.action.toLowerCase().replace('_', ' ')}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">{log.details || 'System event triggered'}</p>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {format(new Date(log.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-zinc-600 text-xs">No recent activity detected.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Health Score</p>
          <p className="text-3xl font-black text-emerald-500">94.2%</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Active Burndown</p>
          <p className="text-3xl font-black text-amber-500">12h</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Team Efficiency</p>
          <p className="text-3xl font-black text-indigo-500">+12%</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Backlog Depth</p>
          <p className="text-3xl font-black text-zinc-300">{stats.total}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
