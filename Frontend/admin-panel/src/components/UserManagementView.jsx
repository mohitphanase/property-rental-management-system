import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Filter, Trash2, Mail, Phone, Calendar, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  const fetchUsers = async (selectedRole) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getAdminUsers(selectedRole);
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMessage(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name || 'this user'}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.userId !== id && u.user_id !== id));
      showToast(`User ${name || ''} deleted.`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Error: ${err.message || 'Failed to delete user'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredUsers = users.filter(u => {
    const uName = u.name || '';
    const uEmail = u.email || '';
    const uPhone = u.phone || '';
    return uName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           uEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
           uPhone.includes(searchTerm);
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-header">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>User Management</h2>
      </div>

      {toastMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '280px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by user name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role Filter:</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              outline: 'none'
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="TENANT">Tenants Only</option>
            <option value="OWNER">Property Owners Only</option>
            <option value="ADMIN">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Name & Details</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const uId = user.userId || user.user_id;
                  const userName = user.name || 'Unnamed User';
                  const regDate = user.createdAt || user.created_at || 'N/A';

                  return (
                    <tr key={uId}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            className="user-avatar"
                            style={{
                              backgroundColor: user.role === 'OWNER' ? '#10b981' : user.role === 'ADMIN' ? '#f43f5e' : '#6366f1',
                              width: '38px',
                              height: '38px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {getInitials(userName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{userName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Mail size={12} /> {user.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Phone size={13} /> {user.phone || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: user.role === 'OWNER' ? 'rgba(16,185,129,0.15)' : user.role === 'ADMIN' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)',
                          color: user.role === 'OWNER' ? 'var(--accent-emerald)' : user.role === 'ADMIN' ? 'var(--accent-rose)' : 'var(--accent-primary)',
                          border: `1px solid ${user.role === 'OWNER' ? 'rgba(16,185,129,0.3)' : user.role === 'ADMIN' ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`
                        }}>
                          <Shield size={12} /> {user.role || 'USER'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} /> {regDate}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleDeleteUser(uId, userName)}
                          disabled={deletingId === uId}
                          title="Delete User"
                          style={{ width: '32px', height: '32px', borderColor: 'rgba(244,63,94,0.3)' }}
                        >
                          <Trash2 size={15} color="var(--accent-rose)" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
