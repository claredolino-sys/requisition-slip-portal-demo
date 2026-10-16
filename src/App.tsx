import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context';
import { Layout, ProtectedRoute } from './components/layout';
import {
  AdminDashboard,
  AdminInboxPage,
  ApprovedRISPage,
  AuthPage,
  EmployeeRISPage,
  GuestDashboard,
  InventoryPage,
  ReportsPage,
  SuperAdminPage,
} from './pages';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading RIS Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!user ? <GuestDashboard /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
      
      {/* Dynamic Role Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.role === 'employee' && <EmployeeRISPage />}
              {(user?.role === 'admin' || user?.role === 'admin_administrative') && <AdminDashboard />}
              {user?.role === 'superadmin' && <SuperAdminPage />}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Inbox */}
      <Route
        path="/admin-inbox"
        element={
          <ProtectedRoute allowedRoles={['admin', 'admin_administrative']}>
            <Layout>
              <AdminInboxPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Requisition Creation Slip */}
      <Route
        path="/new-ris"
        element={
          <ProtectedRoute>
            <Layout>
              <GuestDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Central Inventory Catalog & Ledger */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['admin', 'admin_administrative', 'superadmin']}>
            <Layout>
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Approved Records Ledger */}
      <Route
        path="/approved-ris"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <ApprovedRISPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Custodian Reporting & Analytics */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin', 'admin_administrative']}>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Wildcard Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
