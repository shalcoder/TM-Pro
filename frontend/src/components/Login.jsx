import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, LogIn, GitHub, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Access Granted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Use relative path for Docker/Nginx compatibility
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">TM PRO</h1>
        </div>

        <div className="glass-card p-10">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-zinc-500 text-sm mb-8">Identify yourself to access the workspace.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input
                  type="email"
                  className="input-field pl-12"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input
                  type="password"
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : <><LogIn size={16} /> Enter Workspace</>}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-dark-card px-4 text-zinc-600">Secure SSO</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-medium text-zinc-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 rounded-xl transition-all text-sm font-medium text-zinc-300">
              <GitHub size={18} />
              GitHub
            </button>
          </div>

          <p className="mt-10 text-center text-zinc-600 text-xs">
            New to TM PRO? <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
