import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Building2, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', organizationName: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-dark to-dark">
      <Toaster />
      <div className="glass w-full max-w-md p-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold gradient-text tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm">Start managing your team effectively</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                className="input-field pl-12"
                placeholder="Acme Corp"
                value={formData.organizationName}
                onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                className="input-field pl-12"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                className="input-field pl-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 mt-4"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={18} />}
            {loading ? 'Creating workspace...' : 'Get Started Free'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
