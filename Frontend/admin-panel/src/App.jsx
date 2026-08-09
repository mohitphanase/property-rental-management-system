import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import PropertyManagementView from './components/PropertyManagementView';
import BookingManagementView from './components/BookingManagementView';
import ReviewManagementView from './components/ReviewManagementView';
import ReportsView from './components/ReportsView';
import { api } from './services/api';

function AdminApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getAdminProperties()
        .then(props => {
          if (Array.isArray(props)) {
            const pending = props.filter(p => p && p.status === 'PENDING').length;
            setPendingCount(pending);
          }
        })
        .catch(err => console.error('Safe property fetch error:', err));
    }
  }, [isAuthenticated, activeTab]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        pendingPropertyCount={pendingCount}
      />

      <div className="main-wrapper">
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          toggleSidebar={toggleSidebar}
          onQuickAction={() => setActiveTab('properties')}
        />

        <main className="page-body">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(tab) => setActiveTab(tab)} />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'properties' && <PropertyManagementView />}
          {activeTab === 'bookings' && <BookingManagementView />}
          {activeTab === 'reviews' && <ReviewManagementView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
