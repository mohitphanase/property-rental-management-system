import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Star, Building2, User, AlertCircle, Search, 
  Filter, RefreshCw, MessageSquare, Award, Sparkles 
} from 'lucide-react';

export default function ReviewManagementView() {
  const [reviews, setReviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [allReviews, allProps] = await Promise.all([
        api.getAllReviews().catch(() => []),
        api.getAdminProperties().catch(() => [])
      ]);

      setReviews(allReviews || []);
      setProperties(allProps || []);
    } catch (err) {
      console.error('Error fetching review data:', err);
      setErrorMessage('Failed to load reviews. Please verify backend server connection.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const num = Math.min(5, Math.max(1, Number(rating) || 5));
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star 
        key={idx} 
        size={16} 
        fill={idx < num ? '#f59e0b' : 'none'} 
        color={idx < num ? '#f59e0b' : 'var(--text-subtle)'} 
      />
    ));
  };

  // Filtered reviews computation
  const filteredReviews = reviews.filter(rev => {
    // Property Filter
    if (selectedPropertyId !== 'ALL') {
      const pId = String(rev.propertyId || rev.property_id || '');
      if (pId !== String(selectedPropertyId)) return false;
    }
    // Rating Filter
    if (selectedRating !== 'ALL') {
      if (Number(rev.rating) !== Number(selectedRating)) return false;
    }
    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const comment = (rev.comment || '').toLowerCase();
      const pTitle = (rev.propertyTitle || rev.property_title || '').toLowerCase();
      const tenant = (rev.tenantName || rev.tenant_name || '').toLowerCase();
      if (!comment.includes(q) && !pTitle.includes(q) && !tenant.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Calculate Statistics
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalCount).toFixed(1) 
    : '0.0';
  const fiveStarCount = reviews.filter(r => Number(r.rating) === 5).length;
  const uniquePropertiesCount = new Set(reviews.map(r => r.propertyId || r.property_id).filter(Boolean)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="section-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={24} style={{ color: 'var(--accent-primary)' }} />
            Reviews & Ratings Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Monitor and manage customer feedback across all property listings.
          </p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

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
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} /> {errorMessage}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Reviews</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={20} fill="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Rating</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>{avgRating} / 5.0</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>5-Star Ratings</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>{fiveStarCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Properties Reviewed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>{uniquePropertiesCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search by comment, tenant, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Property Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Properties</option>
              {properties.map(p => {
                const pId = p.propertyId || p.property_id || p.id;
                return (
                  <option key={pId} value={pId}>
                    {p.title || `Property #${pId}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Rating Dropdown */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
            <div>Loading reviews from backend database...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>No Reviews Found</h3>
            <p style={{ fontSize: '0.88rem' }}>
              {reviews.length === 0 
                ? 'No review records currently exist in the database for properties.' 
                : 'No reviews match your current search or filter criteria.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((rev, index) => (
            <div key={rev.review_id || rev.reviewId || index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {renderStars(rev.rating)}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  {rev.rating}.0 / 5.0
                </span>
              </div>

              <p style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-main)', 
                fontStyle: 'italic', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '0.85rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                lineHeight: '1.45' 
              }}>
                "{rev.comment || 'No written comment provided.'}"
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  <Building2 size={14} /> {rev.propertyTitle || rev.property_title || `Property #${rev.propertyId || rev.property_id || 'N/A'}`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', fontWeight: 500 }}>
                    <User size={13} style={{ color: 'var(--text-muted)' }} /> {rev.tenantName || rev.tenant_name || 'Tenant User'}
                  </span>
                  <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>{rev.createdAt || rev.created_at || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
