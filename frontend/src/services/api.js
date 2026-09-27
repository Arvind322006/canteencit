const API_BASE_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('canteen_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  demoLogin: (role) => fetchAPI('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => fetchAPI('/auth/me'),

  // Food Menu
  getFoodItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/food?${query}`);
  },
  getFoodById: (id) => fetchAPI(`/food/${id}`),
  addFoodItem: (data) => fetchAPI('/food', { method: 'POST', body: JSON.stringify(data) }),
  updateFoodItem: (id, data) => fetchAPI(`/food/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleAvailability: (id, is_available) => fetchAPI(`/food/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ is_available }) }),
  deleteFoodItem: (id) => fetchAPI(`/food/${id}`, { method: 'DELETE' }),
  getCategories: () => fetchAPI('/food/categories/all'),

  // Inventory
  getInventory: () => fetchAPI('/inventory'),
  updateInventory: (id, data) => fetchAPI(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addInventoryItem: (data) => fetchAPI('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  deleteInventoryItem: (id) => fetchAPI(`/inventory/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => fetchAPI('/orders'),
  getOrderById: (id) => fetchAPI(`/orders/${id}`),
  getPickupSlots: () => fetchAPI('/orders/slots/available'),
  placeOrder: (data) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status, rejection_reason) => fetchAPI(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejection_reason }) }),
  verifyQR: (orderId) => fetchAPI('/orders/verify-qr', { method: 'POST', body: JSON.stringify({ orderId }) }),

  // Demand Forecasting
  getDemandForecast: () => fetchAPI('/forecasting/demand'),

  // Waste Management
  getWasteRecords: () => fetchAPI('/waste'),
  logWasteRecord: (data) => fetchAPI('/waste', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Dashboard
  getDashboardSummary: () => fetchAPI('/analytics/dashboard-summary'),
  getChartsData: () => fetchAPI('/analytics/charts'),

  // Notifications
  getNotifications: () => fetchAPI('/notifications'),
  markNotificationsRead: () => fetchAPI('/notifications/mark-read', { method: 'PATCH' }),

  // Reviews
  getReviews: (food_id) => fetchAPI(`/reviews${food_id ? `?food_id=${food_id}` : ''}`),
  submitReview: (data) => fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(data) })
};
