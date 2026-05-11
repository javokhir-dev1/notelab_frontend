import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { Settings2, Sun, Moon, Globe, Loader, Plus, Trash2, Edit3, X, Check } from 'lucide-react';

function SettingModal({ setting, userId, onClose, onSave }) {
  const [form, setForm] = useState({
    user_id: setting?.user_id || userId,
    theme: setting?.theme || 'dark',
    language: setting?.language || 'uz',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err?.response?.data?.message || 'Xato'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between" style={{marginBottom:'24px'}}>
          <h2 className="modal-title" style={{marginBottom:0}}>{setting ? 'Sozlamani tahrirlash' : 'Yangi sozlama'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="form-group">
            <label className="form-label">Mavzu</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              {['dark','light'].map(t => (
                <label key={t} style={{display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'10px',cursor:'pointer',border:`1.5px solid ${form.theme===t?'var(--accent)':'var(--border)'}`,background:form.theme===t?'var(--accent-dim)':'var(--bg-secondary)'}}>
                  <input type="radio" name="theme" value={t} checked={form.theme===t} onChange={e=>setForm(p=>({...p,theme:e.target.value}))} style={{display:'none'}}/>
                  {t==='dark'?<Moon size={16} style={{color:'var(--accent)'}}/>:<Sun size={16} style={{color:'var(--warning)'}}/>}
                  <span style={{fontSize:'13px',fontWeight:'500'}}>{t==='dark'?'Qorong\'u':'Yorug\''}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Til</label>
            <select className="form-input" value={form.language} onChange={e=>setForm(p=>({...p,language:e.target.value}))}>
              <option value="uz">🇺🇿 O'zbek</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>
          <div className="flex gap-3" style={{justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={14} className="spin-anim"/> : <Check size={14}/>} Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const url = role === 'admin' ? '/settings' : `/settings/user/${user?.id}/setting/1`;
      const { data } = await api.get(url);
      setSettings(Array.isArray(data) ? data : data ? [data] : []);
    } catch { setSettings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchSettings(); }, [user]);

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.post('/settings', form);
      toast.success('Sozlama yaratildi!');
    } else {
      await api.put(`/settings/user/${user.id}/setting/${modal.id}`, form);
      toast.success('Yangilandi!');
    }
    fetchSettings();
  };

  const handleDelete = async (s) => {
    if (!confirm("Sozlamani o'chirasizmi?")) return;
    try {
      await api.delete(`/settings/user/${user.id}/setting/${s.id}`);
      toast.success("O'chirildi");
      fetchSettings();
    } catch { toast.error("Xato"); }
  };

  const themeIcon = (t) => t === 'dark' ? <Moon size={20}/> : <Sun size={20}/>;
  const langLabel = (l) => l==='uz'?'🇺🇿 O\'zbek':l==='ru'?'🇷🇺 Русский':'🇬🇧 English';

  return (
    <Layout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">⚙️ Sozlamalar</h1>
          <p className="page-subtitle">Interfeys sozlamalarini boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16}/> Yangi sozlama
        </button>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner"/></div>
      ) : settings.length === 0 ? (
        <div className="empty-state">
          <Settings2 size={64} className="empty-icon"/>
          <p className="empty-title">Sozlamalar yo'q</p>
          <p className="empty-desc">Birinchi sozlamani yarating</p>
          <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16}/>Yaratish</button>
        </div>
      ) : (
        <div className="grid-2">
          {settings.map(s => (
            <div key={s.id} className="card" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,var(--accent),#06b6d4)'}}/>
              <div className="flex items-center justify-between" style={{marginBottom:'16px'}}>
                <div style={{width:'42px',height:'42px',background:'var(--accent-dim)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)'}}>
                  {themeIcon(s.theme)}
                </div>
                <div className="flex gap-2">
                  <button className="btn-icon" onClick={() => setModal(s)}><Edit3 size={14}/></button>
                  <button className="btn-icon" style={{color:'var(--danger)'}} onClick={() => handleDelete(s)}><Trash2 size={14}/></button>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                  <span style={{color:'var(--text-muted)'}}>Mavzu</span>
                  <span style={{fontWeight:'600'}}>{s.theme==='dark'?'Qorong\'u':'Yorug\''}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                  <span style={{color:'var(--text-muted)'}}>Til</span>
                  <span style={{fontWeight:'600'}}>{langLabel(s.language)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <SettingModal
          setting={modal === 'create' ? null : modal}
          userId={user?.id}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <style>{`.spin-anim { animation: spin 0.7s linear infinite; }`}</style>
    </Layout>
  );
}
