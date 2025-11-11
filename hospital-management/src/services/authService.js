import api from './api';

const extractAuthPayload = (response) => {
  const payload = response?.data ?? response;
  const authData = payload?.data ?? payload;
  return {
    token: authData?.token || null,
    refreshToken: authData?.refreshToken || null,
    user: authData?.user || null,
  };
};

const persistAuth = ({ token, refreshToken, user }) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const auth = extractAuthPayload(response);
    persistAuth(auth);
    return auth;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const auth = extractAuthPayload(response);
    persistAuth(auth);
    return auth;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  fetchProfile: async () => {
    const response = await api.get('/auth/me');
    const payload = response?.data ?? response;
    const profile = payload?.data ?? payload;
    return profile || null;
  },
};

