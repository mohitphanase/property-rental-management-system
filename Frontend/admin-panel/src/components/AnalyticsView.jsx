import React from 'react';
import { BarChart3, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const latencyData = [
  { time: '00:00', apiLatency: 45, dbLatency: 12 },
  { time: '04:00', apiLatency: 38, dbLatency: 10 },
  { time: '08:00', apiLatency: 95, dbLatency: 28 },
  { time: '12:00', apiLatency: 140, dbLatency: 42 },
  { time: '16:00', apiLatency: 110, dbLatency: 35 },
  { time: '20:00', apiLatency: 65, dbLatency: 18 },
];

export default function AnalyticsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>System Analytics</h2>
        </div>
      </div>

      {/* Latency Chart */}
      <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
        <div className="section-header">
          <h3 className="section-title">API Response & Database Latency (ms)</h3>
          <span className="status-pill active">Realtime Socket Connected</span>
        </div>
        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-subtle)" fontSize={12} />
              <YAxis stroke="var(--text-subtle)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="apiLatency" stroke="#6366f1" strokeWidth={3} name="REST / GraphQL Endpoint (ms)" />
              <Line type="monotone" dataKey="dbLatency" stroke="#06b6d4" strokeWidth={3} name="Cloud DB Sync (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Audit Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <div className="section-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--accent-emerald)" /> Native Crash Free Rate
            </h3>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>99.98%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            0.02% crash rate reported in iOS WKWebView sandbox and Android WebView client runtime over past 30 days.
          </p>
        </div>

        <div className="glass-card">
          <div className="section-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--accent-amber)" /> Network Retries
            </h3>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>142</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Automatic offline queue retries processed seamlessly via Background Sync.
          </p>
        </div>
      </div>
    </div>
  );
}
