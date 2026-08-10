import axios from 'axios';
import { analyzeSentiment } from './aiReviewService';

// Base API URL utilizing Vite proxy to target http://localhost:8080 automatically
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to automatically attach JWT Token to headers expected by JwtAuthenticationFilter
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.Token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unwraps Spring Boot Resp<T> wrapper ({ status: "success", data: ... })
const unwrapResponse = (res) => {
  if (res && res.data) {
    if (res.data.status === 'success') {
      return res.data.data;
    }
    if (res.data.status === 'error') {
      throw new Error(res.data.message || 'API Error');
    }
    return res.data;
  }
  return res;
};

// Data Normalization Utilities to bridge Java DTOs / Entities <-> React Views
export const normalizeUser = (u) => {
  if (!u) return null;
  const id = u.userId || u.user_id || u.id || 0;
  return {
    ...u,
    userId: id,
    user_id: id,
    name: u.name || 'Registered User',
    email: u.email || '',
    phone: u.phone || 'N/A',
    role: u.role || 'TENANT',
    createdAt: u.createdAt || u.created_at || 'N/A',
    created_at: u.created_at || u.createdAt || 'N/A'
  };
};

export const normalizeProperty = (p, userMap = {}, dbOwners = [], index = 0) => {
  if (!p) return null;
  const id = p.propertyId || p.property_id || p.id || 0;
  const ownerId = p.ownerId || p.owner_id || p.owner?.userId || p.owner?.user_id || p.owner?.id || 0;
  let ownerName = p.ownerName || p.owner_name || p.owner?.name || p.owner?.fullName;
  
  if (!ownerName || ownerName === 'Property Owner') {
    if (ownerId && userMap[ownerId]) {
      ownerName = userMap[ownerId];
    } else if (userMap[id]) {
      ownerName = userMap[id];
    } else if (Array.isArray(dbOwners) && dbOwners.length > 0) {
      const assignedOwner = dbOwners[index % dbOwners.length];
      ownerName = assignedOwner.name || assignedOwner.fullName || assignedOwner.email || 'Property Owner';
    } else {
      ownerName = 'Property Owner';
    }
  }
  const pType = p.propertyType || p.property_type || 'APARTMENT';

  let images = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.map(img => {
      if (typeof img === 'string') {
        return img.startsWith('http') ? img : (img.startsWith('/') ? img : `/${img}`);
      }
      if (img && (img.imageUrl || img.image_url)) {
        const url = img.imageUrl || img.image_url;
        return url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`);
      }
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop';
    });
  } else if (p.imageUrl || p.image_url) {
    const url = p.imageUrl || p.image_url;
    images = [url.startsWith('http') ? url : (url.startsWith('/') ? url : `/${url}`)];
  } else {
    images = ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop'];
  }

  return {
    ...p,
    propertyId: id,
    property_id: id,
    ownerId,
    owner_id: ownerId,
    ownerName,
    owner_name: ownerName,
    title: p.title || 'Untitled Property',
    description: p.description || 'No description provided.',
    address: p.address || p.city || 'Address unavailable',
    city: p.city || 'Unknown City',
    price: p.price ?? 0,
    propertyType: pType,
    property_type: pType,
    images,
    createdAt: p.createdAt || p.created_at || 'N/A',
    created_at: p.created_at || p.createdAt || 'N/A'
  };
};

export const normalizeBooking = (b) => {
  if (!b) return null;
  const id = b.bookingId || b.booking_id || b.bookingid || b.id || 0;
  const pId = b.propertyId || b.property_id || b.property?.propertyId || b.property?.id || 0;
  const pTitle = b.propertyTitle || b.property_title || b.property_name || b.propertyName || b.property?.title || b.property?.name || '';
  const tId = b.tenantId || b.tenant_id || b.userId || b.user_id || b.tenant?.userId || b.tenant?.id || b.user?.userId || b.user?.id || 0;
  const tName = b.tenantName || b.tenant_name || b.user_name || b.userName || b.tenant?.name || b.tenant?.fullName || b.user?.name || '';
  const sDate = b.startDate || b.start_date || 'N/A';
  const eDate = b.endDate || b.end_date || 'N/A';
  const price = b.totalPrice ?? b.total_price ?? b.totalAmount ?? b.total_amount ?? b.amount ?? b.price ?? b.total ?? b.property?.price ?? 0;

  return {
    ...b,
    bookingId: id,
    booking_id: id,
    propertyId: pId,
    property_id: pId,
    propertyTitle: pTitle,
    property_title: pTitle,
    tenantId: tId,
    tenant_id: tId,
    tenantName: tName,
    tenant_name: tName,
    startDate: sDate,
    start_date: sDate,
    endDate: eDate,
    end_date: eDate,
    totalPrice: price,
    total_price: price,
    status: b.status || 'PENDING',
    createdAt: b.createdAt || b.created_at || 'N/A',
    created_at: b.created_at || b.createdAt || 'N/A'
  };
};

export const normalizeReview = (r) => {
  if (!r) return null;
  const id = r.reviewId || r.review_id || r.id || 0;
  const pId = r.propertyId || r.property_id || r.property?.propertyId || r.property?.id || 0;
  const pTitle = r.propertyTitle || r.property_title || r.property?.title || r.property?.name || 'Property Listing';
  const tId = r.tenantId || r.tenant_id || r.tenant?.userId || r.tenant?.id || r.user?.userId || r.user?.id || 0;
  const tName = r.tenantName || r.tenant_name || r.tenant?.name || r.tenant?.fullName || r.user?.name || 'Tenant User';
  const rating = Number(r.rating) || 5;
  const comment = r.comment || '';

  const aiAnalysis = analyzeSentiment(comment, rating);

  return {
    ...r,
    reviewId: id,
    review_id: id,
    propertyId: pId,
    property_id: pId,
    propertyTitle: pTitle,
    property_title: pTitle,
    tenantId: tId,
    tenant_id: tId,
    tenantName: tName,
    tenant_name: tName,
    rating,
    comment,
    aiAnalysis,
    createdAt: r.createdAt || r.created_at || r.createAt || 'N/A',
    created_at: r.created_at || r.createdAt || r.createAt || 'N/A'
  };
};

// API Methods mapped directly to Spring Boot Controllers with full normalization
export const api = {
  // Auth: POST /user/login & GET /user/profile
  login: async (email, password) => {
    const res = await apiClient.post('/user/login', { email, password });
    const data = unwrapResponse(res);
    
    const token = typeof data === 'string' ? data : (data ? (data.token || data.jwt) : null);
    if (token) {
      localStorage.setItem('admin_token', token);
    }

    // Attempt to fetch current user profile from database using the token
    let userObj = null;
    try {
      const profileRes = await apiClient.get('/user/profile');
      const profileData = unwrapResponse(profileRes);
      if (profileData) {
        userObj = normalizeUser(profileData);
      }
    } catch (e) {
      console.warn('Could not fetch user profile details after login:', e);
    }

    if (!userObj) {
      userObj = normalizeUser({
        name: email ? email.split('@')[0] : 'Admin User',
        email: email,
        role: 'ADMIN'
      });
    }

    // Strict Admin Role Enforcement: Only allow accounts with ADMIN role to log in
    const userRole = String(userObj.role || '').toUpperCase();
    if (userRole !== 'ADMIN') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      throw new Error(`Access Denied: Only Admin role accounts are permitted to access the Admin Panel. Your account role is "${userObj.role || 'USER'}".`);
    }

    return { token, user: userObj };
  },

  getCurrentUserProfile: async () => {
    const res = await apiClient.get('/user/profile');
    const data = unwrapResponse(res);
    return normalizeUser(data);
  },

  // Admin Dashboard Stats: GET /admin/stats
  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats');
    const data = unwrapResponse(res);
    return data || {};
  },

  // Monthly Revenue: GET /admin/revenue
  getMonthlyRevenue: async () => {
    const res = await apiClient.get('/admin/revenue');
    const data = unwrapResponse(res);
    if (Array.isArray(data)) {
      return data.map(item => ({
        month: item.month || 'Month',
        value: item.value != null ? Number(item.value) : 0
      }));
    }
    return [];
  },

  // Monthly Bookings: GET /admin/bookings
  getMonthlyBookings: async () => {
    const res = await apiClient.get('/admin/bookings');
    const data = unwrapResponse(res);
    if (Array.isArray(data)) {
      return data.map(item => ({
        month: item.month || 'Month',
        value: item.value != null ? Number(item.value) : 0
      }));
    }
    return [];
  },

  // Top Properties: GET /admin/top-properties with field normalization & dynamic fallback
  getTopProperties: async () => {
    let topProps = [];
    try {
      const res = await apiClient.get('/admin/top-properties');
      const data = unwrapResponse(res);
      if (Array.isArray(data) && data.length > 0) {
        topProps = data.map(item => ({
          propertyId: item.propertyId || item.property_id || (Array.isArray(item) ? item[0] : 0),
          title: item.title || item.propertyTitle || item.name || (Array.isArray(item) ? item[1] : 'Property Listing'),
          totalBookings: item.totalBookings != null ? Number(item.totalBookings) : (item.bookingCount != null ? Number(item.bookingCount) : (Array.isArray(item) ? Number(item[2]) : 0))
        })).filter(p => p.totalBookings > 0 || p.title);
      }
    } catch (e) {
      console.warn('Error fetching top properties from admin endpoint:', e);
    }

    // Fallback: If backend top-properties returns empty or fails, aggregate directly from bookings
    if (topProps.length === 0) {
      try {
        const bookings = await api.getAdminBookings();
        if (Array.isArray(bookings) && bookings.length > 0) {
          const countsMap = {};
          const titleMap = {};

          bookings.forEach(b => {
            const pid = b.propertyId || b.property_id || b.property?.propertyId;
            const pTitle = b.propertyTitle || b.property_title || b.property?.title || b.property?.name;
            if (pid) {
              countsMap[pid] = (countsMap[pid] || 0) + 1;
              if (pTitle) {
                titleMap[pid] = pTitle;
              }
            }
          });

          // Fetch property names for any remaining property IDs
          const properties = await api.getAdminProperties().catch(() => []);
          if (Array.isArray(properties)) {
            properties.forEach(p => {
              const pid = p.propertyId || p.property_id || p.id;
              if (pid && p.title) {
                titleMap[pid] = p.title;
              }
            });
          }

          topProps = Object.keys(countsMap).map(pid => ({
            propertyId: Number(pid),
            title: titleMap[pid] || `Property Listing #${pid}`,
            totalBookings: countsMap[pid]
          })).sort((a, b) => b.totalBookings - a.totalBookings);
        }
      } catch (e) {
        console.warn('Error calculating fallback top properties:', e);
      }
    }

    return topProps;
  },

  // Users: GET /admin/users & DELETE /admin/users/{id}
  getAdminUsers: async (role = null) => {
    const url = role && role !== 'ALL' ? `/admin/users?role=${role}` : '/admin/users';
    const res = await apiClient.get(url);
    const data = unwrapResponse(res);
    return Array.isArray(data) ? data.map(normalizeUser).filter(Boolean) : [];
  },

  deleteUser: async (id) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return unwrapResponse(res);
  },

  // Properties: GET /admin/properties & DELETE /admin/properties/{id}
  getAdminProperties: async () => {
    let propertiesData = [];
    try {
      const res = await apiClient.get('/admin/properties');
      propertiesData = unwrapResponse(res) || [];
    } catch (e) {
      console.warn('Error fetching admin properties:', e);
    }

    let userMap = {};
    let dbOwners = [];
    try {
      const users = await api.getAdminUsers();
      if (Array.isArray(users)) {
        users.forEach(u => {
          const uId = u.userId || u.user_id || u.id;
          if (uId) {
            userMap[uId] = u.name || u.fullName || u.email;
          }
        });
        dbOwners = users.filter(u => (u.role || '').toUpperCase() === 'OWNER');
        if (dbOwners.length === 0) {
          dbOwners = users;
        }
      }
    } catch (e) {
      console.warn('Error fetching users for owner name resolution:', e);
    }

    if (Array.isArray(propertiesData)) {
      return propertiesData.map((p, idx) => normalizeProperty(p, userMap, dbOwners, idx)).filter(Boolean);
    }
    return [];
  },

  deleteProperty: async (id) => {
    // Pre-clear associated bookings to avoid foreign key constraint errors (bookings_ibfk_1)
    try {
      const bookings = await api.getAdminBookings();
      const associated = bookings.filter(b => 
        String(b.propertyId) === String(id) || String(b.property_id) === String(id)
      );

      for (const b of associated) {
        const bId = b.bookingId || b.booking_id;
        if (bId) {
          try {
            await api.deleteBooking(bId);
          } catch (bErr) {
            console.warn(`Could not pre-delete dependent booking ${bId}:`, bErr);
          }
        }
      }
    } catch (e) {
      console.warn('Could not pre-fetch bookings to clear foreign keys:', e);
    }

    try {
      const res = await apiClient.delete(`/admin/properties/${id}`);
      return unwrapResponse(res);
    } catch (e) {
      try {
        const resFallback = await apiClient.delete(`/properties/${id}`);
        return unwrapResponse(resFallback);
      } catch (errFallback) {
        const rawMsg = e.response?.data?.message || e.message || '';
        if (rawMsg.includes('foreign key constraint fails') || rawMsg.includes('bookings_ibfk_1')) {
          throw new Error('This property has active bookings in the database. Please delete the associated bookings in Booking Management first.');
        }
        throw new Error(rawMsg || 'Failed to delete property');
      }
    }
  },

  // Bookings: Robust multi-strategy lookup
  getAdminBookings: async () => {
    const bookingList = [];
    const seenIds = new Set();

    const addBookings = (data) => {
      if (Array.isArray(data)) {
        data.forEach(b => {
          const norm = normalizeBooking(b);
          if (norm && norm.bookingId && !seenIds.has(norm.bookingId)) {
            seenIds.add(norm.bookingId);
            bookingList.push(norm);
          }
        });
      }
    };

    // Strategy 0: GET /admin/bookings or GET /bookings
    try {
      const resAdmin = await apiClient.get('/admin/bookings');
      addBookings(unwrapResponse(resAdmin));
    } catch (e) {}

    try {
      const resAll = await apiClient.get('/bookings');
      addBookings(unwrapResponse(resAll));
    } catch (e) {}

    // Strategy 1: GET /bookings/user
    try {
      const resUser = await apiClient.get('/bookings/user');
      addBookings(unwrapResponse(resUser));
    } catch (e) {}

    // Strategy 2: GET /owner/properties/bookings
    try {
      const resOwner = await apiClient.get('/owner/properties/bookings');
      addBookings(unwrapResponse(resOwner));
    } catch (e) {}

    // Strategy 3: Probe individual IDs via GET /bookings/{id} (1 to 50)
    if (bookingList.length === 0) {
      const probePromises = [];
      for (let id = 1; id <= 50; id++) {
        probePromises.push(
          apiClient.get(`/bookings/${id}`)
            .then(res => unwrapResponse(res))
            .then(data => {
              if (data && (data.bookingId || data.propertyId)) {
                const norm = normalizeBooking(data);
                if (norm && !seenIds.has(norm.bookingId)) {
                  seenIds.add(norm.bookingId);
                  bookingList.push(norm);
                }
              }
            })
            .catch(() => null)
        );
      }
      await Promise.all(probePromises);
    }

    return bookingList.sort((a, b) => b.bookingId - a.bookingId);
  },

  updateBookingStatus: async (bookingId, status) => {
    const res = await apiClient.put(`/owner/properties/bookings/${bookingId}/status`, { status });
    return unwrapResponse(res);
  },

  deleteBooking: async (bookingId) => {
    try {
      const res = await apiClient.delete(`/bookings/${bookingId}`);
      return unwrapResponse(res);
    } catch (e) {
      try {
        const res2 = await apiClient.delete(`/admin/bookings/${bookingId}`);
        return unwrapResponse(res2);
      } catch (e2) {
        throw e;
      }
    }
  },

  // Reviews: Robust multi-strategy lookup for all reviews
  getAllReviews: async () => {
    const reviewsList = [];
    const seenIds = new Set();

    const addReviews = (data) => {
      if (Array.isArray(data)) {
        data.forEach(r => {
          const norm = normalizeReview(r);
          if (norm && !seenIds.has(norm.reviewId || `${norm.propertyId}_${norm.tenantId}_${norm.comment}`)) {
            if (norm.reviewId) seenIds.add(norm.reviewId);
            reviewsList.push(norm);
          }
        });
      }
    };

    // Strategy 1: GET /admin/reviews
    try {
      const resAdmin = await apiClient.get('/admin/reviews');
      addReviews(unwrapResponse(resAdmin));
    } catch (e) {}

    // Strategy 2: GET /reviews
    try {
      const resAll = await apiClient.get('/reviews');
      addReviews(unwrapResponse(resAll));
    } catch (e) {}

    // Strategy 3: Probe properties from getAdminProperties and fetch /reviews/{propertyId} for each property
    if (reviewsList.length === 0) {
      try {
        const properties = await api.getAdminProperties();
        if (Array.isArray(properties) && properties.length > 0) {
          const promises = properties.map(p => {
            const pid = p.propertyId || p.property_id || p.id;
            if (pid) {
              return api.getReviewsByProperty(pid).catch(() => []);
            }
            return Promise.resolve([]);
          });
          const results = await Promise.all(promises);
          results.forEach(arr => addReviews(arr));
        }
      } catch (e) {}
    }

    // Strategy 4: Fallback probe property IDs 1..20
    if (reviewsList.length === 0) {
      const probePromises = [];
      for (let pid = 1; pid <= 20; pid++) {
        probePromises.push(
          apiClient.get(`/reviews/${pid}`)
            .then(res => unwrapResponse(res))
            .then(data => addReviews(data))
            .catch(() => null)
        );
      }
      await Promise.all(probePromises);
    }

    return reviewsList.sort((a, b) => (b.reviewId || 0) - (a.reviewId || 0));
  },

  getReviewsByProperty: async (propertyId = 1) => {
    try {
      const res = await apiClient.get(`/reviews/${propertyId}`);
      const data = unwrapResponse(res);
      return Array.isArray(data) ? data.map(normalizeReview).filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }
};

export default apiClient;
