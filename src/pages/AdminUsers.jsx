import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { Users, Trash2, Edit3, UserCircle, X, Check, Loader, Shield } from 'lucide-react';

function UserModal({ user: u, onClose, onSave }) {
  const [form, setForm] = useState({ username: u?.username||'', bio: u?.bio||'', avatar_url: u?.avatar_url||'' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err?.response?.data?.message||'Xato'); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between" style={{marginBottom:'24px'}}>
          <h2 className="modal-title" style={{marginBottom:0}}>Foydalanuvchini tahrirlash</h2>
          <button className="btn-icon" onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <input className="form-input" value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input className="form-input" value={form.avatar_url} onChange={e=>setForm(p=>({...p,avatar_url:e.target.value}))}/>
          </div>
          <div className="flex gap-3" style={{justifyContent:'flex-end'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading?<Loader size={14} className="spin-anim"/>:<Check size={14}/>} Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch { toast.error('Yuklashda xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (form) => {
    await api.put(`/users/${modal.id}`, form);
    toast.success('Yangilandi!');
    fetchUsers();
  };

  const handleDelete = async (u) => {
    if (!confirm(`"${u.username}"ni o'chirasizmi?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success("O'chirildi");
      fetchUsers();
    } catch { toast.error("Xato"); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">👥 Foydalanuvchilar</h1>
        <p className="page-subtitle">{users.length} ta foydalanuvchi</p>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner"/></div>
      ) : (
        <div className="admin-table-wrap card" style={{padding:0}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Bio</th>
                <th>Yaratilgan</th>
                <th style={{textAlign:'right'}}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" style={{width:'36px',height:'36px',borderRadius:'10px',objectFit:'cover'}}/>
                      ) : (
                        <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,var(--accent),#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px'}}>
                          {u.username?.slice(0,2).toUpperCase()}
                        </div>
                      )}
                      <span style={{fontWeight:'600'}}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text-muted)',fontSize:'13px'}}>{u.bio || '—'}</td>
                  <td style={{color:'var(--text-muted)',fontSize:'13px'}}>{new Date(u.createdAt).toLocaleDateString('uz-UZ')}</td>
                  <td style={{textAlign:'right'}}>
                    <div className="flex gap-2" style={{justifyContent:'flex-end'}}>
                      <button className="btn-icon" onClick={()=>setModal(u)}><Edit3 size={14}/></button>
                      <button className="btn-icon" style={{color:'var(--danger)'}} onClick={()=>handleDelete(u)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <UserModal user={modal} onClose={()=>setModal(null)} onSave={handleSave}/>}

      <style>{`
        .admin-table-wrap { border-radius:16px; overflow:hidden; }
        .admin-table { width:100%; border-collapse:collapse; }
        .admin-table th { padding:14px 20px; text-align:left; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); background:var(--bg-secondary); border-bottom:1px solid var(--border); }
        .admin-table td { padding:14px 20px; font-size:14px; border-bottom:1px solid var(--border); }
        .admin-table tr:last-child td { border-bottom:none; }
        .admin-table tbody tr:hover { background:var(--bg-hover); }
        .spin-anim { animation: spin 0.7s linear infinite; }
      `}</style>
    </Layout>
  );
}
