import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, NotebookPen, StickyNote, Settings,
  Users, Shield, LogOut, ChevronRight, Sparkles, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Sidebar.css';

const userLinks = [
  { to: '/notebooks', icon: NotebookPen, label: 'Daftarlar' },
  { to: '/notes', icon: StickyNote, label: 'Notalar' },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
];

const adminLinks = [
  { to: '/admin/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/admin/admins', icon: Shield, label: 'Adminlar' },
  { to: '/notebooks', icon: NotebookPen, label: 'Daftarlar' },
  { to: '/notes', icon: StickyNote, label: 'Notalar' },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Chiqildi");
    navigate('/login');
  };

  const links = role === 'admin' ? adminLinks : userLinks;
  const initials = user?.username?.slice(0,2).toUpperCase() || '??';

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <div className="sidebar-logo-icon" style={{width:36,height:36,borderRadius:10}}>
          <BookOpen size={18} />
        </div>
        <span className="sidebar-logo-name">NoteLab</span>
        <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><BookOpen size={22} /></div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">NoteLab</span>
            <span className="sidebar-logo-sub">Workspace</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">Navigatsiya</div>

        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="sidebar-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user?.username}</span>
              <span className={`badge ${role === 'admin' ? 'badge-accent' : 'badge-success'}`}>
                {role === 'admin' ? <Shield size={10}/> : <Sparkles size={10}/>}
                {role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <button className="btn-icon sidebar-logout" onClick={handleLogout} title="Chiqish">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
