import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { resetDemoData } from '../utils/mockApi';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, UserCheck, RefreshCw, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: '',
    password: '',
    full_name: '',
    department: '',
    division: '',
    office: '',
    designation: '',
    email: '',
    confirm_password: '',
  });

  const handleQuickLogin = async (employee_id: string, password: string, roleName: string) => {
    try {
      const res = await api.post('/auth/login', { employee_id, password });
      login(res.data.token, res.data.user);
      toast.success(`Logged in as ${roleName}`);
      await checkPendingRIS();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Quick login failed');
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    toast.success('Demo environment data reset to initial clean state');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          employee_id: formData.employee_id,
          password: formData.password,
        });
        login(res.data.token, res.data.user);
        toast.success('Logged in successfully');
        await checkPendingRIS();
        navigate('/dashboard');
      } else {
        if (formData.password !== formData.confirm_password) {
          return toast.error('Passwords do not match');
        }
        const res = await api.post('/auth/register', formData);
        login(res.data.token, res.data.user);
        toast.success('Account created successfully');
        await checkPendingRIS();
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    }
  };

  const checkPendingRIS = async () => {
    const pendingId = localStorage.getItem('pending_ris_id');
    if (pendingId) {
      try {
        await api.post('/ris/claim', { ris_id: pendingId });
        const res = await api.get('/auth/me');
        updateUser(res.data);
        localStorage.removeItem('pending_ris_id');
        localStorage.removeItem('draft_ris');
        toast.success('Draft RIS claimed successfully');
      } catch (err) {
        console.error('Failed to claim RIS', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200">
        <div>
          <div className="flex justify-between items-center mb-3">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to RIS Form
            </Link>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-600" /> Demo Replica
            </span>
          </div>

          <h2 className="mt-2 text-center text-3xl font-extrabold text-[#1A2340]">
            RIS Portal
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            {isLogin ? 'Requisition & Issue Slip Management System' : 'Create a generic demo account'}
          </p>
        </div>

        {/* Demo Fast-Switch Panel for Portfolio Walkthrough */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-xl border border-blue-100/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              1-Click Demo Profiles (Walkthrough):
            </p>
            <button
              onClick={handleResetDemo}
              title="Reset mock database to initial seeded records"
              className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset Data
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('emp1', 'emp1', 'Citizen A (Employee)')}
              className="px-2.5 py-2 text-xs font-medium text-left bg-white hover:bg-blue-600 hover:text-white rounded-lg border border-gray-200 hover:border-blue-600 transition-all shadow-2xs group"
            >
              <span className="font-semibold block truncate">Citizen A</span>
              <span className="text-[10px] text-gray-400 group-hover:text-blue-100 block truncate">Employee Role</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('emp2', 'emp2', 'Citizen B (Analyst)')}
              className="px-2.5 py-2 text-xs font-medium text-left bg-white hover:bg-blue-600 hover:text-white rounded-lg border border-gray-200 hover:border-blue-600 transition-all shadow-2xs group"
            >
              <span className="font-semibold block truncate">Citizen B</span>
              <span className="text-[10px] text-gray-400 group-hover:text-blue-100 block truncate">Staff Analyst</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin', 'Admin Custodian')}
              className="px-2.5 py-2 text-xs font-medium text-left bg-white hover:bg-emerald-600 hover:text-white rounded-lg border border-gray-200 hover:border-emerald-600 transition-all shadow-2xs group"
            >
              <span className="font-semibold block truncate">Admin Custodian</span>
              <span className="text-[10px] text-gray-400 group-hover:text-emerald-100 block truncate">Supply & Inbox</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin', 'superadmin', 'Super Admin')}
              className="px-2.5 py-2 text-xs font-medium text-left bg-white hover:bg-purple-600 hover:text-white rounded-lg border border-gray-200 hover:border-purple-600 transition-all shadow-2xs group"
            >
              <span className="font-semibold block truncate">Super Admin</span>
              <span className="text-[10px] text-gray-400 group-hover:text-purple-100 block truncate">System Governance</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-xs uppercase font-medium text-gray-400">or sign in manually</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Citizen Sample" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="citizen@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Technology Division" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                  <input className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Operations Officer" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID / Username</label>
              <input required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="emp1 / admin / superadmin" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input required type={showConfirmPassword ? "text" : "password"} className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10" placeholder="••••••••" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2563EB] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm">
              {isLogin ? 'Sign in' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-gray-100">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-left mb-3 shadow-xs">
            <p className="text-[11px] text-amber-800 leading-snug">
              <strong>Note:</strong> This is a sanitized demo version of a system originally built for a government agency. All sensitive data and proprietary branding have been removed or anonymized to comply with privacy requirements.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Portfolio Demo Replica • Sanitized Mock Architecture
          </p>
        </div>
      </div>
    </div>
  );
}

