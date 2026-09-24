// API Client for Secure Banking Management System
const API_BASE_URL = 'http://localhost:8080/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
      setStoredUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        primaryAccountNumber: data.primaryAccountNumber,
      });
    }
    return data;
  },

  register: async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
      setStoredUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        primaryAccountNumber: data.primaryAccountNumber,
      });
    }
    return data;
  },

  getProfile: () => request('/auth/me'),

  // Accounts
  getMyAccounts: () => request('/accounts/my-accounts'),
  getAccount: (accNum) => request(`/accounts/${accNum}`),
  verifyBeneficiary: (accNum) => request(`/accounts/verify/${accNum}`),
  createAccount: (accountType = 'SAVINGS', initialDeposit = 0) =>
    request(`/accounts/new?accountType=${accountType}&initialDeposit=${initialDeposit}`, {
      method: 'POST',
    }),

  // Transactions
  deposit: (accountNumber, amount, description) =>
    request('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, amount: parseFloat(amount), description }),
    }),

  withdraw: (accountNumber, amount, description) =>
    request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, amount: parseFloat(amount), description }),
    }),

  transfer: (fromAccountNumber, toAccountNumber, amount, description) =>
    request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountNumber,
        toAccountNumber,
        amount: parseFloat(amount),
        description,
      }),
    }),

  getHistory: (accountNumber) => request(`/transactions/history/${accountNumber}`),
  getReceipt: (referenceNumber) => request(`/transactions/receipt/${referenceNumber}`),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getAllAccounts: () => request('/admin/accounts'),
  getAllTransactions: () => request('/admin/transactions'),
  updateAccountStatus: (accountNumber, status) =>
    request(`/admin/accounts/${accountNumber}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
