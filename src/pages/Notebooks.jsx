import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { NotebookPen, Plus, Trash2, Edit3, Star, StarOff, Loader, BookOpen, X, Check } from 'lucide-react';

function NotebookModal({ notebook, onClose, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: notebook?.title || '',
    is_favorite: notebook?.is_favorite || false,
    user_id: notebook?.user_id || user?.id,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error("Sarlavha kiriting"); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err?.response?.data?.message || 'Xato'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between" style={{marginBottom:'24px'}}>
          <h2 className="modal-title" style={{marginBottom:0}}>{notebook ? 'Daftarni tahrirlash' : 'Yangi daftar'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="form-group">
            <label className="form-label">Sarlavha</label>
            <input className="form-input" placeholder="Daftar nomi..." value={form.title}
              onChange={e => setForm(p=>({...p, title: e.target.value}))}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',padding:'12px',borderRadius:'10px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
            <input type="checkbox" checked={form.is_favorite} onChange={e => setForm(p=>({...p, is_favorite: e.target.checked}))} style={{width:'16px',height:'16px',accentColor:'var(--warning)'}}/>
            <Star size={16} style={{color:'var(--warning)'}}/> <span style={{fontSize:'14px',fontWeight:'500'}}>Sevimlilar</span>
          </label>
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

export default function Notebooks() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | notebook object

  const fetchNotebooks = async () => {
    setLoading(true);
    try {
      const url = role === 'admin' ? '/notebooks' : `/notebooks/user/${user?.id}`;
      const { data } = await api.get(url);
      setNotebooks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Daftarlarni yuklashda xato');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchNotebooks(); }, [user]);

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.post('/notebooks', form);
      toast.success('Daftar yaratildi!');
    } else {
      await api.put(`/notebooks/user/${user.id}/notebook/${modal.id}`, form);
      toast.success('Daftar yangilandi!');
    }
    fetchNotebooks();
  };

  const handleDelete = async (nb) => {
    if (!confirm(`"${nb.title}" daftarini o'chirasizmi?`)) return;
    try {
      await api.delete(`/notebooks/user/${user.id}/notebook/${nb.id}`);
      toast.success("O'chirildi");
      fetchNotebooks();
    } catch { toast.error("O'chirishda xato"); }
  };

  return (
    <Layout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📓 Daftarlar</h1>
          <p className="page-subtitle">{notebooks.length} ta daftar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16}/> Yangi daftar
        </button>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner"/></div>
      ) : notebooks.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} className="empty-icon"/>
          <p className="empty-title">Daftarlar yo'q</p>
          <p className="empty-desc">Birinchi daftaringizni yarating</p>
          <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16}/>Yaratish</button>
        </div>
      ) : (
        <div className="grid-2">
          {notebooks.map(nb => (
            <div
              key={nb.id}
              className="card notebook-card"
              onClick={() => navigate(`/notebooks/${nb.id}`)}
            >
              <div className="flex items-center justify-between" style={{marginBottom:'12px'}}>
                <div className="notebook-icon"><NotebookPen size={20}/></div>
                <div className="flex gap-2">
                  {nb.is_favorite && <Star size={14} style={{color:'var(--warning)'}}/>}
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); setModal(nb); }}><Edit3 size={14}/></button>
                  <button className="btn-icon btn-danger-icon" onClick={e => { e.stopPropagation(); handleDelete(nb); }}><Trash2 size={14}/></button>
                </div>
              </div>
              <h3 style={{fontSize:'16px',fontWeight:'700',marginBottom:'6px'}}>{nb.title}</h3>
              <p style={{fontSize:'12px',color:'var(--text-muted)'}}>
                {new Date(nb.createdAt).toLocaleDateString('uz-UZ')}
              </p>
              <p style={{fontSize:'11px',color:'var(--accent)',marginTop:'8px',fontWeight:'500'}}>Ochish uchun bosing →</p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <NotebookModal
          notebook={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <style>{`
        .notebook-card { cursor: pointer; position: relative; overflow: hidden; transition: transform 0.18s, box-shadow 0.18s; }
        .notebook-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); border-color: var(--accent) !important; }
        .notebook-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--accent), #a855f7);
        }
        .notebook-icon {
          width: 40px; height: 40px;
          background: var(--accent-dim);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
        }
        .btn-danger-icon:hover { background: var(--danger-dim) !important; color: var(--danger) !important; border-color: transparent !important; }
      `}</style>
    </Layout>
  );
}
