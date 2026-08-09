import React, { useState } from 'react';
import { api } from '../services/api';
import { FileText, Download, DollarSign, Calendar, CheckCircle2, Loader2 } from 'lucide-react';

export default function ReportsView() {
  const [downloadMsg, setDownloadMsg] = useState('');
  const [exporting, setExporting] = useState(null);

  const downloadCSV = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRevenue = async () => {
    setExporting('revenue');
    try {
      const data = await api.getMonthlyRevenue();
      let csv = 'Month,Revenue (₹)\n';
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          csv += `"${item.month}",${item.value}\n`;
        });
      } else {
        csv += '"No data available",0\n';
      }
      downloadCSV('monthly_revenue_report.csv', csv);
      setDownloadMsg('Exported Monthly Revenue Summary to CSV file!');
    } catch (err) {
      alert('Failed to generate revenue report: ' + err.message);
    } finally {
      setExporting(null);
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const handleExportProperties = async () => {
    setExporting('properties');
    try {
      const data = await api.getAdminProperties();
      let csv = 'Title,Type,City,Price (₹/night),Owner Name\n';
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(p => {
          csv += `"${p.title?.replace(/"/g, '""')}","${p.propertyType}","${p.city}",${p.price},"${p.ownerName}"\n`;
        });
      } else {
        csv += 'No listings found,N/A,N/A,0,N/A\n';
      }
      downloadCSV('properties_inventory_report.csv', csv);
      setDownloadMsg('Exported Properties Inventory to CSV file!');
    } catch (err) {
      alert('Failed to generate properties report: ' + err.message);
    } finally {
      setExporting(null);
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  const handleExportUsers = async () => {
    setExporting('users');
    try {
      const data = await api.getAdminUsers();
      let csv = 'Full Name,Email,Phone,Role,Registered Date\n';
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(u => {
          csv += `"${u.name?.replace(/"/g, '""')}","${u.email}","${u.phone}","${u.role}","${u.createdAt}"\n`;
        });
      } else {
        csv += 'No users found,N/A,N/A,N/A,N/A\n';
      }
      downloadCSV('user_accounts_audit_report.csv', csv);
      setDownloadMsg('Exported User Accounts Audit Log to CSV file!');
    } catch (err) {
      alert('Failed to generate user audit report: ' + err.message);
    } finally {
      setExporting(null);
      setTimeout(() => setDownloadMsg(''), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Reports</h2>
        </div>
      </div>

      {downloadMsg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{downloadMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Revenue Summary</h3>
            </div>
          </div>
          <button className="btn-primary" onClick={handleExportRevenue} disabled={exporting === 'revenue'}>
            {exporting === 'revenue' ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Export Revenue CSV
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <Calendar size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Properties Inventory Report</h3>
            </div>
          </div>
          <button className="btn-secondary" onClick={handleExportProperties} disabled={exporting === 'properties'}>
            {exporting === 'properties' ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Export Inventory CSV
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tenant & Owner Audit Log</h3>
            </div>
          </div>
          <button className="btn-secondary" onClick={handleExportUsers} disabled={exporting === 'users'}>
            {exporting === 'users' ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Export User Audit CSV
          </button>
        </div>
      </div>
    </div>
  );
}
