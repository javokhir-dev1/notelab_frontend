import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Notebooks from './pages/Notebooks';
import NotebookChat from './pages/NotebookChat';
import Notes from './pages/Notes';
import SettingsPage from './pages/SettingsPage';
import AdminUsers from './pages/AdminUsers';
import AdminAdmins from './pages/AdminAdmins';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner" style={{width:'32px',height:'32px',borderWidth:'3px'}}/>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/notebooks" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/notebooks" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/notebooks" element={<PrivateRoute><Notebooks /></PrivateRoute>} />
      <Route path="/notebooks/:notebookId" element={<PrivateRoute><NotebookChat /></PrivateRoute>} />
      <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/admins" element={<AdminRoute><AdminAdmins /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/notebooks" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1d27',
              color: '#e8eaf6',
              border: '1px solid #2a2d3e',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a1d27' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1d27' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
