import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  Star, 
  FileSpreadsheet, 
  LogOut, 
  Building,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, pendingPropertyCount = 0 }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'properties', label: 'Manage Properties', icon: Building2, badge: pendingPropertyCount > 0 ? `${pendingPropertyCount} Pending` : null },
    { id: 'bookings', label: 'Manage Bookings', icon: CalendarCheck },
    { id: 'reviews', label: 'Manage Reviews', icon: Star },
    { id: 'reports', label: 'View Reports', icon: FileSpreadsheet },
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-badge">
          <Building size={22} />
        </div>
        <div>
          <h2 className="logo-text">Rental Admin</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth <= 992) setSidebarOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="status-pill pending" style={{ marginLeft: 'auto', fontSize: '0.68rem', padding: '0.1rem 0.5rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar" style={{ backgroundColor: '#f43f5e' }}>AD</div>
          <div className="user-info">
            <span className="user-name">{user ? user.name : 'System Admin'}</span>
            <span className="user-role" style={{ color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <ShieldCheck size={12} /> {user ? user.role : 'ADMIN'}
            </span>
          </div>
          <button 
            className="icon-btn" 
            onClick={logout}
            style={{ marginLeft: 'auto', width: '32px', height: '32px' }} 
            title="Logout"
          >
            <LogOut size={16} color="var(--accent-rose)" />
          </button>
        </div>
      </div>
    </aside>
  );
}
