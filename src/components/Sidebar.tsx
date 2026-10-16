import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Inbox, Package, FileText, LogOut, ChevronLeft, ChevronRight, X, PlusCircle, FileDown } from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  if (!user) return null;

  const navItems = [
    { 
      path: '/dashboard', 
      label: user.role === 'employee' ? 'My RIS Records' : 'Dashboard', 
      icon: Home, 
      roles: ['employee', 'admin', 'admin_administrative', 'superadmin'] 
    },
    { 
      path: '/new-ris', 
      label: 'New RIS Slip', 
      icon: PlusCircle, 
      roles: ['employee'] 
    },
    { 
      path: '/admin-inbox', 
      label: 'Admin Inbox', 
      icon: Inbox, 
      roles: ['admin', 'admin_administrative'] 
    },
    { 
      path: '/inventory', 
      label: 'Inventory Management', 
      icon: Package, 
      roles: ['admin', 'admin_administrative', 'superadmin'] 
    },
    { 
      path: '/approved-ris', 
      label: 'Approved RIS', 
      icon: FileText, 
      roles: ['superadmin'] 
    },
    { 
      path: '/reports', 
      label: 'Reports & Analytics', 
      icon: FileText, 
      roles: ['admin', 'admin_administrative'] 
    },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Drawer on mobile, Sidebar on tablet/desktop */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-50 flex flex-col flex-shrink-0 bg-[#1A2340] text-white transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Desktop Collapse / Expand Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-10 bg-blue-600 rounded-full p-1 text-white shadow-lg z-10 hover:bg-blue-700 transition-colors items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Sidebar Header */}
        <div className={`p-4 border-b border-white/10 flex items-center justify-between ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
              RIS
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold text-sm leading-tight tracking-wide">RIS Portal</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Appendix 63 System</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="md:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-1">
          {(!isCollapsed || mobileOpen) && (
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 py-2">
              Navigation
            </div>
          )}

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed && !mobileOpen ? item.label : ''}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive 
                    ? 'bg-blue-600/30 text-white shadow-xs font-semibold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${isCollapsed && !mobileOpen ? 'md:justify-center' : ''}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-blue-500 rounded-r" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                {(!isCollapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-white/10">
            <a
              href="/PRD.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="RIS_Portal_PRD_Appendix63.pdf"
              title={isCollapsed && !mobileOpen ? 'PRD Document (PDF)' : ''}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-600/30 border border-blue-400/20 transition-all ${
                isCollapsed && !mobileOpen ? 'md:justify-center' : ''
              }`}
            >
              <FileDown size={17} className="flex-shrink-0 text-blue-400" />
              {(!isCollapsed || mobileOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">PRD Document (PDF)</span>
                  <span className="text-[9px] text-blue-400/80 truncate">With Visual Diagrams</span>
                </div>
              )}
            </a>
          </div>
        </nav>

        {/* User Card & Logout at Footer */}
        <div className="p-4 border-t border-white/10 bg-[#161d36]/50">
          <div className={`flex items-center ${isCollapsed && !mobileOpen ? 'md:justify-center' : 'gap-3'} mb-3`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ring-2 ring-white/10">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-white/50 truncate capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title={isCollapsed && !mobileOpen ? 'Logout' : ''}
            className={`flex items-center gap-2.5 text-white/70 hover:text-white hover:bg-white/10 py-2 px-2.5 rounded-lg text-xs font-medium w-full transition-colors ${
              isCollapsed && !mobileOpen ? 'md:justify-center' : ''
            }`}
          >
            <LogOut size={16} className="flex-shrink-0 text-red-400" />
            {(!isCollapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
