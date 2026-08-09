import React from 'react';
import { Search, Bell, Sun, Moon, Menu, Sparkles, RefreshCw } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, toggleSidebar, onQuickAction }) {
  return (
    <header className="top-navbar">
      <div className="header-left">
        <button className="icon-btn" onClick={toggleSidebar} style={{ display: 'flex' }}>
          <Menu size={20} />
        </button>
        
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Search users, app logs, devices, APIs..." />
        </div>
      </div>

      <div className="header-right">
        <button className="btn-primary" onClick={onQuickAction}>
          <Sparkles size={16} />
          <span>Quick Broadcast</span>
        </button>

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="icon-badge"></span>
        </button>
      </div>
    </header>
  );
}
