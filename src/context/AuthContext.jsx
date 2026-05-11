import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (token && stored && stored !== 'undefined' && stored !== 'null') {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setUser(parsed);
          setRole(storedRole);
        }
      } catch {
        // Buzilgan ma'lumot — tozalaymiz
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, isAdmin = false) => {
    const prefix = isAdmin ? 'adminauth' : 'userauth';
    const { data } = await api.post(`/${prefix}/login`, { username, password });
    // Backend access_token (underscore) yoki accessToken qaytarishi mumkin
    const token = data.access_token || data.accessToken;
    localStorage.setItem('accessToken', token);
    // Backend qaytaradigan user/admin obyektini aniqlash
    const profile = data.user || data.admin || null;
    const userId = profile?.id ?? data.userId ?? data.id;
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', isAdmin ? 'admin' : 'user');
    if (profile && typeof profile === 'object') {
      localStorage.setItem('user', JSON.stringify(profile));
    } else if (userId) {
      // Profile kelmagan bo'lsa minimal ma'lumot saqlaymiz
      const minimal = { id: userId, username };
      localStorage.setItem('user', JSON.stringify(minimal));
    }
    setUser(profile || { id: userId, username });
    setRole(isAdmin ? 'admin' : 'user');
    return data;
  };

  const register = async (formData, isAdmin = false) => {
    const prefix = isAdmin ? 'adminauth' : 'userauth';
    const { data } = await api.post(`/${prefix}/register`, formData);
    return data;
  };

  const logout = async () => {
    const storedRole = localStorage.getItem('role');
    const prefix = storedRole === 'admin' ? 'adminauth' : 'userauth';
    try { await api.post(`/${prefix}/logout`); } catch {}
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
