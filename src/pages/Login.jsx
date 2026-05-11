import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, UserPlus, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error("Barcha maydonlarni to'ldiring"); return; }
    setLoading(true);
    try {
      await login(form.username, form.password, isAdmin);
      toast.success('Xush kelibsiz! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb1" />
        <div className="auth-orb orb2" />
        <div className="auth-orb orb3" />
      </div>
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon"><BookOpen size={28} /></div>
          <span>NoteLab</span>
        </div>
        <div className="auth-card card">
          <h1 className="auth-title">Xush kelibsiz!</h1>
          <p className="auth-subtitle">Hisobingizga kiring</p>

          <div className="auth-toggle">
            <button className={!isAdmin ? 'active' : ''} onClick={() => setIsAdmin(false)}>Foydalanuvchi</button>
            <button className={isAdmin ? 'active' : ''} onClick={() => setIsAdmin(true)}>Admin</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Foydalanuvchi nomi</label>
              <input
                className="form-input"
                type="text"
                placeholder="username"
                value={form.username}
                onChange={e => setForm(p => ({...p, username: e.target.value}))}
              />
            </div>
            <div className="form-group" style={{position:'relative'}}>
              <label className="form-label">Parol</label>
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••"
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                style={{paddingRight:'44px'}}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(p=>!p)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
              {loading ? <Loader size={16} className="spin-anim"/> : <LogIn size={16}/>}
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <p className="auth-footer">
            Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
