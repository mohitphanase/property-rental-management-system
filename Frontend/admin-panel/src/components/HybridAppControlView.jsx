import React, { useState } from 'react';
import { Smartphone, Radio, Send, RefreshCw, Layers, CheckCircle2, ShieldAlert, Cpu, Database, BellRing } from 'lucide-react';

export default function HybridAppControlView() {
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [targetOS, setTargetOS] = useState('all');
  const [notificationSent, setNotificationSent] = useState(false);

  const [featureFlags, setFeatureFlags] = useState([
    { id: 'sqlite_sync', label: 'Offline SQLite Local Sync Engine', enabled: true, desc: 'Allows mobile clients to perform offline writes & auto-sync when reconnected.' },
    { id: 'biometric_auth', label: 'Native FaceID / Fingerprint Lock', enabled: true, desc: 'Enforces native device biometric authentication prompt.' },
    { id: 'dark_theme_v2', label: 'Dark Mode Glass UI v2.5', enabled: true, desc: 'Pushes new glassmorphic styles down to mobile webviews.' },
    { id: 'beta_checkout', label: 'In-App One-Click Apple Pay / Google Pay', enabled: false, desc: 'Native payment sheet integration for faster checkout.' },
  ]);

  const toggleFlag = (id) => {
    setFeatureFlags(featureFlags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSendPush = (e) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return;
    setNotificationSent(true);
    setTimeout(() => {
      setPushTitle('');
      setPushBody('');
      setNotificationSent(false);
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Hybrid App Command Center</h2>
        </div>
        <button className="btn-primary">
          <RefreshCw size={16} /> Publish OTA Hotfix
        </button>
      </div>

      {/* Grid for Version & Sync Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Active App Build Versions */}
        <div className="glass-card">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Smartphone size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Client Build Versions</h3>
            </div>
            <span className="status-pill active">Syncing</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600 }}>iOS Native Wrapper (Capacitor)</span>
                <span className="status-pill active" style={{ fontSize: '0.7rem' }}>v2.4.1 (Build 184)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>94% of iOS users on latest native binary.</p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600 }}>Android APK / AAB Bundle</span>
                <span className="status-pill active" style={{ fontSize: '0.7rem' }}>v2.4.0 (Build 202)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>89% of Android devices synced with cloud backend.</p>
            </div>
          </div>
        </div>

        {/* Local Storage & Native Plugin Health */}
        <div className="glass-card">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Native Plugin Health</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'Camera & QR Scanner', status: 'Operational', latency: '12ms' },
              { name: 'Geolocation / GPS Bridge', status: 'Operational', latency: '8ms' },
              { name: 'Biometric FaceID / TouchID', status: 'Operational', latency: '4ms' },
              { name: 'SQLite Sync DB Storage', status: 'Operational', latency: '18ms' },
            ].map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{p.latency}</span>
                  <span className="status-pill active" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remote Config & Feature Flags */}
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Radio size={20} color="var(--accent-amber)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Remote Feature Flags</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Toggle app features live across mobile clients without App Store re-submission.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {featureFlags.map((flag) => (
            <div key={flag.id} style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: flag.enabled ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${flag.enabled ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{flag.label}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{flag.desc}</p>
              </div>
              <button 
                className={flag.enabled ? 'btn-primary' : 'btn-secondary'}
                onClick={() => toggleFlag(flag.id)}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', width: 'fit-content' }}
              >
                {flag.enabled ? 'Active (Click to Disable)' : 'Disabled (Click to Activate)'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notification Dispatcher */}
      <div className="glass-card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BellRing size={20} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dispatch Mobile Push Notification</h3>
          </div>
        </div>

        {notificationSent && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Push notification dispatched to FCM & APNS gateways!</span>
          </div>
        )}

        <form onSubmit={handleSendPush} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Notification Title</label>
              <input 
                type="text" 
                placeholder="e.g. 🎉 New App Update v2.4 Available!"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Target OS</label>
              <select 
                value={targetOS}
                onChange={(e) => setTargetOS(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              >
                <option value="all">All Devices (iOS & Android)</option>
                <option value="ios">iOS App Users Only</option>
                <option value="android">Android App Users Only</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Message Body</label>
            <textarea 
              rows={3}
              placeholder="Enter push alert message content for mobile app users..."
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary">
              <Send size={16} /> Broadcast Push Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
