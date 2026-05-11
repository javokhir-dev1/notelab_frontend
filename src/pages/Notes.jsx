import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { StickyNote, Plus, Trash2, Edit3, Pin, Star, Loader, X, Check, FileText } from 'lucide-react';

function NoteModal({ note, notebooks, userId, onClose, onSave }) {
  const [form, setForm] = useState({
    user_id: note?.user_id || userId,
    notebook_id: note?.notebook_id || (notebooks[0]?.id || ''),
    content: note?.content || '',
    type: note?.type || 'text',
    is_pinned: note?.is_pinned || false,
    is_favorite: note?.is_favorite || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content) { toast.error("Kontent kiriting"); return; }
    if (!form.notebook_id) { toast.error("Daftar tanlang"); return; }
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err?.response?.data?.message || 'Xato'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:'560px'}}>
        <div className="flex items-center justify-between" style={{marginBottom:'24px'}}>
          <h2 className="modal-title" style={{marginBottom:0}}>{note ? 'Notani tahrirlash' : 'Yangi nota'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="form-group">
            <label className="form-label">Daftar</label>
            <select className="form-input" value={form.notebook_id} onChange={e => setForm(p=>({...p, notebook_id: Number(e.target.value)}))}>
              {notebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kontent</label>
            <textarea className="form-input" placeholder="Nota matni..." value={form.content}
              onChange={e => setForm(p=>({...p, content: e.target.value}))} style={{minHeight:'120px'}}/>
          </div>
          <div className="form-group">
            <label className="form-label">Tur</label>
            <select className="form-input" value={form.type} onChange={e => setForm(p=>({...p, type: e.target.value}))}>
              <option value="text">Matn</option>
              <option value="checklist">Cheklis</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <label style={{flex:1,display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',padding:'10px 12px',borderRadius:'10px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
              <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p=>({...p,is_pinned:e.target.checked}))} style={{accentColor:'var(--accent)'}}/>
              <Pin size={14}/> <span style={{fontSize:'13px'}}>Mahkamla</span>
            </label>
            <label style={{flex:1,display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',padding:'10px 12px',borderRadius:'10px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
              <input type="checkbox" checked={form.is_favorite} onChange={e => setForm(p=>({...p,is_favorite:e.target.checked}))} style={{accentColor:'var(--warning)'}}/>
              <Star size={14}/> <span style={{fontSize:'13px'}}>Sevimli</span>
            </label>
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

export default function Notes() {
  const { user, role } = useAuth();
  const [notes, setNotes] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) { fetchData(); }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const nbUrl = role === 'admin' ? '/notebooks' : `/notebooks/user/${user.id}`;
      const { data: nbs } = await api.get(nbUrl);
      const nbList = Array.isArray(nbs) ? nbs : [];
      setNotebooks(nbList);

      let allNotes = [];
      if (role === 'admin') {
        const { data } = await api.get('/notes');
        allNotes = Array.isArray(data) ? data : [];
      } else {
        for (const nb of nbList) {
          try {
            const { data } = await api.get(`/notes/user/${user.id}/folder/${nb.id}`);
            if (Array.isArray(data)) allNotes.push(...data);
          } catch {}
        }
      }
      setNotes(allNotes);
    } catch { toast.error('Notalarni yuklashda xato'); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.post('/notes', form);
      toast.success('Nota yaratildi!');
    } else {
      await api.put(`/notes/user/${user.id}/note/${modal.id}`, form);
      toast.success('Nota yangilandi!');
    }
    fetchData();
  };

  const handleDelete = async (note) => {
    if (!confirm("Notani o'chirasizmi?")) return;
    try {
      await api.delete(`/notes/user/${user.id}/note/${note.id}`);
      toast.success("O'chirildi");
      fetchData();
    } catch { toast.error("Xato"); }
  };

  const filtered = filter === 'pinned' ? notes.filter(n=>n.is_pinned)
    : filter === 'favorite' ? notes.filter(n=>n.is_favorite) : notes;

  const nbName = (id) => notebooks.find(n=>n.id===id)?.title || 'Daftar';

  return (
    <Layout>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📝 Notalar</h1>
          <p className="page-subtitle">{filtered.length} ta nota</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')} disabled={notebooks.length===0}>
          <Plus size={16}/> Yangi nota
        </button>
      </div>

      <div className="note-filters">
        {['all','pinned','favorite'].map(f => (
          <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
            {f==='all'?'Barchasi':f==='pinned'?'📌 Mahkamlangan':'⭐ Sevimli'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} className="empty-icon"/>
          <p className="empty-title">Notalar yo'q</p>
          <p className="empty-desc">{notebooks.length===0 ? 'Avval daftar yarating' : 'Birinchi notangizni yarating'}</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(note => (
            <div key={note.id} className="card note-card">
              <div className="flex items-center justify-between" style={{marginBottom:'10px'}}>
                <span className="badge badge-accent">{nbName(note.notebook_id)}</span>
                <div className="flex gap-2">
                  {note.is_pinned && <Pin size={13} style={{color:'var(--accent)'}}/>}
                  {note.is_favorite && <Star size={13} style={{color:'var(--warning)'}}/>}
                  <button className="btn-icon" onClick={() => setModal(note)}><Edit3 size={13}/></button>
                  <button className="btn-icon" style={{color:'var(--danger)'}} onClick={() => handleDelete(note)}><Trash2 size={13}/></button>
                </div>
              </div>
              <p className="note-content">{note.content}</p>
              <div className="note-meta">
                <span className="badge badge-success" style={{fontSize:'10px'}}>{note.type}</span>
                <span style={{fontSize:'11px',color:'var(--text-muted)'}}>{new Date(note.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <NoteModal
          note={modal === 'create' ? null : modal}
          notebooks={notebooks}
          userId={user?.id}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <style>{`
        .note-filters { display:flex; gap:8px; margin-bottom:20px; }
        .filter-btn { padding:8px 16px; border-radius:20px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-family:inherit; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; }
        .filter-btn:hover { background:var(--bg-hover); color:var(--text-primary); }
        .filter-btn.active { background:var(--accent-dim); color:var(--accent); border-color:var(--accent); }
        .note-card { cursor:default; }
        .note-content { font-size:14px; color:var(--text-secondary); line-height:1.6; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }
        .note-meta { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid var(--border); }
        .spin-anim { animation: spin 0.7s linear infinite; }
      `}</style>
    </Layout>
  );
}
