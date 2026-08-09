import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Building2, Trash2, Eye, Search, Filter, MapPin, CheckCircle2, AlertCircle, User } from 'lucide-react';

export default function PropertyManagementView() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getAdminProperties();
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties from database:', err);
      setErrorMessage(err.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title || 'this property'}?`)) {
      return;
    }
    setDeletingId(propertyId);
    try {
      await api.deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.property_id !== propertyId && p.propertyId !== propertyId));
      if (selectedProperty && (selectedProperty.property_id === propertyId || selectedProperty.propertyId === propertyId)) {
        setSelectedProperty(null);
      }
      showToast(`Property "${title || 'Listing'}" deleted.`);
    } catch (err) {
      console.error('Error deleting property:', err);
      alert(`Error: ${err.message || 'Failed to delete property'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filtered = properties.filter(p => {
    const pType = (p.property_type || p.propertyType || '').toUpperCase();
    const matchesType = typeFilter === 'ALL' || pType === typeFilter;
    const title = p.title || '';
    const city = p.city || '';
    const address = p.address || '';
    const ownerName = p.owner_name || p.ownerName || p.owner?.name || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'All' || city === cityFilter;
    return matchesType && matchesSearch && matchesCity;
  });

  const cities = ['All', ...new Set(properties.map(p => p.city).filter(Boolean))];
  const propertyTypes = ['ALL', 'APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL','PG','ROOM'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Properties</h2>
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

      {/* Property Type Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {propertyTypes.map((t) => {
          const count = t === 'ALL' ? properties.length : properties.filter(p => (p.property_type || p.propertyType || '').toUpperCase() === t).length;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            >
              <span>{t === 'ALL' ? 'All Types' : t}</span>
              <span style={{
                backgroundColor: typeFilter === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & City Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search property by title, owner name, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City:</span>
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              outline: 'none'
            }}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading properties...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No properties found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((property) => {
            const pId = property.property_id || property.propertyId;
            const pTitle = property.title || 'Untitled Property';
            const pType = property.property_type || property.propertyType || 'APARTMENT';
            const pOwner = property.owner_name || property.ownerName || property.owner?.name || 'Property Owner';
            const pImages = (property.images && property.images.length > 0) ? property.images : [
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop'
            ];

            return (
              <div key={pId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                  <img 
                    src={pImages[0]} 
                    alt={pTitle}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    {pType}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {pTitle}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="var(--accent-cyan)" /> {property.address || property.city || 'Address N/A'}, {property.city || 'City N/A'}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="var(--accent-purple, #a855f7)" />
                    <span>Owner: <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{pOwner}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{property.price ?? 0}</span>
                      {/* <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}> / night</span> */}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }} onClick={() => setSelectedProperty(property)}>
                        <Eye size={14} /> View
                      </button>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleDeleteProperty(pId, pTitle)} 
                        disabled={deletingId === pId}
                        title="Delete Property"
                        style={{ width: '32px', height: '32px', borderColor: 'rgba(244,63,94,0.3)' }}
                      >
                        <Trash2 size={15} color="var(--accent-rose)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (() => {
        const modalPId = selectedProperty.property_id || selectedProperty.propertyId;
        const modalTitle = selectedProperty.title || 'Untitled Property';
        const modalType = selectedProperty.property_type || selectedProperty.propertyType || 'APARTMENT';
        const modalOwner = selectedProperty.owner_name || selectedProperty.ownerName || 'Property Owner';
        const modalImages = (selectedProperty.images && selectedProperty.images.length > 0) ? selectedProperty.images : [
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop'
        ];

        return (
          <div className="modal-overlay" onClick={() => setSelectedProperty(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{modalTitle}</h3>
                <button className="btn-secondary" onClick={() => setSelectedProperty(null)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                  Close
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                {modalImages.map((imgUrl, idx) => (
                  <img 
                    key={idx} 
                    src={imgUrl} 
                    alt="Property" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop';
                    }}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div><strong>Property Name:</strong> {modalTitle}</div>
                <div><strong>Owner:</strong> {modalOwner}</div>
                <div><strong>Location:</strong> {selectedProperty.address || 'Address N/A'}, {selectedProperty.city || 'City N/A'}</div>
                <div><strong>Price:</strong> ₹{selectedProperty.price ?? 0} / night</div>
                <div><strong>Type:</strong> {modalType}</div>
                <div><strong>Description:</strong> {selectedProperty.description || 'No description provided.'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button 
                  className="btn-secondary" 
                  disabled={deletingId === modalPId} 
                  onClick={() => handleDeleteProperty(modalPId, modalTitle)} 
                  style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.3)' }}
                >
                  <Trash2 size={16} /> Delete Property
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
