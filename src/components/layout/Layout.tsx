import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { SuperAdminGlobalNotification } from '../common/SuperAdminGlobalNotification';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
}

export default Layout;
