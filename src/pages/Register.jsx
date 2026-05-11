import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', bio: '', avatar_url: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error("Majburiy maydonlarni to'ldiring"); return; }
    if (form.password.length < 6) { toast.error("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    setLoading(true);
    try {
      await register({ ...form, refresh_token: '' }, false);
      toast.success("Ro'yxatdan o'tdingiz! Kiring.");
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Ro'yxatdan o'tish xatosi");
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
          <h1 className="auth-title">Hisob yaratish</h1>
          <p className="auth-subtitle">NoteLab-ga xush kelibsiz</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Foydalanuvchi nomi <span style={{color:'var(--danger)'}}>*</span></label>
              <input className="form-input" type="text" placeholder="kamida 3 ta belgi"
                value={form.username} onChange={e => setForm(p=>({...p, username: e.target.value}))}/>
            </div>
            <div className="form-group" style={{position:'relative'}}>
              <label className="form-label">Parol <span style={{color:'var(--danger)'}}>*</span></label>
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="kamida 6 ta belgi"
                value={form.password} onChange={e => setForm(p=>({...p, password: e.target.value}))} style={{paddingRight:'44px'}}/>
              <button type="button" className="pass-toggle" onClick={() => setShowPass(p=>!p)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL (ixtiyoriy)</label>
              <input className="form-input" type="url" placeholder="https://..."
                value={form.avatar_url} onChange={e => setForm(p=>({...p, avatar_url: e.target.value}))}/>
            </div>
            <div className="form-group">
              <label className="form-label">Bio (ixtiyoriy)</label>
              <input className="form-input" type="text" placeholder="O'zingiz haqida..."
                value={form.bio} onChange={e => setForm(p=>({...p, bio: e.target.value}))}/>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
              {loading ? <Loader size={16} className="spin-anim"/> : <UserPlus size={16}/>}
              {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <p className="auth-footer">
            Hisobingiz bormi? <Link to="/login">Kiring</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
