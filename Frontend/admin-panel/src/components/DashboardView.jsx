import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  ArrowUpRight, 
  AlertCircle,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setErrorMsg('');
      try {
        const statsData = await api.getAdminStats();
        const revData = await api.getMonthlyRevenue();
        const bookData = await api.getMonthlyBookings();
        const topData = await api.getTopProperties();

        setStats(statsData || {});

        if (Array.isArray(revData)) {
          const formattedRev = revData.map(item => ({
            name: item.month || item.name || 'Month',
            revenue: item.value != null ? Number(item.value) : (item.revenue || 0)
          }));
          setMonthlyRevenue(formattedRev);
        } else {
          setMonthlyRevenue([]);
        }

        if (Array.isArray(bookData)) {
          const formattedBook = bookData.map(item => ({
            month: item.month || item.name || 'Month',
            bookings: item.value != null ? Number(item.value) : (item.bookings || 0)
          }));
          setBookingTrends(formattedBook);
        } else {
          setBookingTrends([]);
        }

        setTopProperties(Array.isArray(topData) ? topData : []);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setErrorMsg(err.message || 'Could not connect to backend server');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Dashboard...
      </div>
    );
  }

  const safeStats = stats || {};
  const totalRevenue = safeStats.totalRevenue != null ? Number(safeStats.totalRevenue) : 0;
  const totalBookings = safeStats.totalBookings ?? 0;
  const totalProperties = safeStats.totalProperties ?? 0;
  const totalUsers = safeStats.totalUsers ?? 0;
  const totalTenants = safeStats.totalTenants ?? 0;
  const totalOwners = safeStats.totalOwners ?? 0;
  const pendingBookings = safeStats.pendingBookings ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
              Dashboard Overview 🏡
            </h1>
          </div>
          {pendingBookings > 0 && (
            <button className="btn-primary" onClick={() => onNavigate('bookings')}>
              <AlertCircle size={16} /> {pendingBookings} Pending Bookings
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Aggregate Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Revenue</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="stat-value">₹{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Bookings</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <CalendarCheck size={22} />
            </div>
          </div>
          <div className="stat-value">{totalBookings}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Properties</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Building2 size={22} />
            </div>
          </div>
          <div className="stat-value">{totalProperties}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Users</span>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="stat-value">{totalUsers}</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Revenue Bar Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '340px' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 className="section-title">Monthly Revenue</h3>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {monthlyRevenue.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No revenue records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-subtle)" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Booking Trends Line Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '340px' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 className="section-title">Booking Trends</h3>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {bookingTrends.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No booking trend records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-subtle)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-subtle)" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#bookGrad)" name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Properties Section */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: '1.2rem', margin: 0 }}>Top Booked Properties</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Highest performing rental listings by total booking volume</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => onNavigate('properties')} 
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', cursor: 'pointer' }}
          >
            Manage Properties
          </button>
        </div>

        {topProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            No top booked property records found yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {topProperties.map((p, idx) => {
              const rankColor = idx === 0 ? '#f59e0b' : (idx === 1 ? '#94a3b8' : (idx === 2 ? '#d97706' : 'var(--accent-primary)'));
              const title = p.title || p.propertyTitle || (Array.isArray(p) ? p[1] : `Property Listing #${idx + 1}`);
              const count = p.totalBookings != null ? p.totalBookings : (p.bookingCount != null ? p.bookingCount : (Array.isArray(p) ? p[2] : 0));

              return (
                <div 
                  key={p.propertyId || idx} 
                  style={{ 
                    padding: '1.1rem', 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'space-between',
                    gap: '1rem',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                    <div style={{ 
                      minWidth: '34px', 
                      height: '34px', 
                      borderRadius: '50%', 
                      background: `${rankColor}20`, 
                      color: rankColor, 
                      fontWeight: '800', 
                      fontSize: '0.88rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justify: 'center',
                      border: `1px solid ${rankColor}40`
                    }}>
                      #{idx + 1}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <Building2 size={12} /> ID: {p.propertyId || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{count}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      {count === 1 ? 'Booking' : 'Bookings'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
