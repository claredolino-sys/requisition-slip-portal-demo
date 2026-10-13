import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import GuestDashboard from './pages/GuestDashboard';
import AuthPage from './pages/AuthPage';
import EmployeeRISPage from './pages/EmployeeRISPage';
import AdminInboxPage from './pages/AdminInboxPage';
import AdminDashboard from './pages/AdminDashboard';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import ApprovedRISPage from './pages/ApprovedRISPage';
import Sidebar from './components/Sidebar';
import SuperAdminGlobalNotification from './components/SuperAdminGlobalNotification';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100 font-sans">
      {/* Mobile Top App Bar (visible on mobile/small screens < md) */}
      <header className="md:hidden bg-[#1A2340] text-white px-4 py-3 flex items-center justify-between z-30 flex-shrink-0 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-xs flex-shrink-0">
              RIS
            </div>
            <div className="leading-tight">
              <span className="font-bold text-sm block">RIS Portal</span>
              <span className="text-[10px] text-white/50 block">Appendix 63</span>
            </div>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 max-w-[120px] truncate hidden sm:inline">{user.full_name}</span>
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shadow-xs">
              {user.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        )}
      </header>

      {/* Responsive Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0 h-full">
        {children}
      </main>

      <SuperAdminGlobalNotification />
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={!user ? <GuestDashboard /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'employee' && <EmployeeRISPage />}
            {(user?.role === 'admin' || user?.role === 'admin_administrative') && <AdminDashboard />}
            {user?.role === 'superadmin' && <SuperAdminPage />}
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin-inbox" element={
        <ProtectedRoute allowedRoles={['admin', 'admin_administrative']}>
          <Layout><AdminInboxPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/new-ris" element={
        <ProtectedRoute>
          <Layout>
            <GuestDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['admin', 'admin_administrative', 'superadmin']}>
          <Layout><InventoryPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/approved-ris" element={
        <ProtectedRoute allowedRoles={['superadmin']}>
          <Layout><ApprovedRISPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'admin_administrative']}>
          <Layout><ReportsPage /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
