import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/notelab',
  withCredentials: true,
});

// Tokenni normalize qilish (backend access_token yoki accessToken qaytarishi mumkin)
const extractToken = (data) => data?.access_token || data?.accessToken;

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    // Refresh endpointning o'zida xato bo'lsa loop oldini olish
    if (original._retry) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    }
    if (err.response?.status === 401) {
      original._retry = true;
      try {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        if (!userId) throw new Error('No userId');
        const prefix = role === 'admin' ? 'adminauth' : 'userauth';
        const { data } = await api.post(`/${prefix}/${userId}/refresh`);
        const newToken = extractToken(data);
        if (!newToken) throw new Error('No token in refresh response');
        localStorage.setItem('accessToken', newToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
