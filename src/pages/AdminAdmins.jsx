import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api';
import toast from 'react-hot-toast';
import { Shield, Trash2, Edit3, Crown, X, Check, Loader } from 'lucide-react';

function AdminModal({ admin, onClose, onSave }) {
  const [form, setForm] = useState({ username: admin?.username||'', bio: admin?.bio||'', avatar_url: admin?.avatar_url||'' });
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
          <h2 className="modal-title" style={{marginBottom:0}}>Adminni tahrirlash</h2>
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

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin');
      setAdmins(Array.isArray(data) ? data : []);
    } catch { toast.error('Yuklashda xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSave = async (form) => {
    await api.put(`/admin/${modal.id}`, form);
    toast.success('Yangilandi!');
    fetchAdmins();
  };

  const handleDelete = async (a) => {
    if (!confirm(`"${a.username}"ni o'chirasizmi?`)) return;
    try {
      await api.delete(`/admin/${a.id}`);
      toast.success("O'chirildi");
      fetchAdmins();
    } catch { toast.error("Xato"); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">🛡️ Adminlar</h1>
        <p className="page-subtitle">{admins.length} ta admin</p>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner"/></div>
      ) : (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{padding:'14px 20px',textAlign:'left',fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--text-muted)',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>Admin</th>
                <th style={{padding:'14px 20px',textAlign:'left',fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--text-muted)',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>Bio</th>
                <th style={{padding:'14px 20px',textAlign:'left',fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--text-muted)',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>Rol</th>
                <th style={{padding:'14px 20px',textAlign:'right',fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'var(--text-muted)',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border)'}}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} style={{borderBottom:'1px solid var(--border)',transition:'background 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,var(--accent),#5b52e6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px'}}>
                        {a.username?.slice(0,2).toUpperCase()}
                      </div>
                      <span style={{fontWeight:'600',fontSize:'14px'}}>{a.username}</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 20px',color:'var(--text-muted)',fontSize:'13px'}}>{a.bio||'—'}</td>
                  <td style={{padding:'14px 20px'}}>
                    {a.is_creator ? (
                      <span className="badge badge-accent"><Crown size={10}/> Creator</span>
                    ) : (
                      <span className="badge badge-success"><Shield size={10}/> Admin</span>
                    )}
                  </td>
                  <td style={{padding:'14px 20px',textAlign:'right'}}>
                    <div className="flex gap-2" style={{justifyContent:'flex-end'}}>
                      <button className="btn-icon" onClick={()=>setModal(a)}><Edit3 size={14}/></button>
                      <button className="btn-icon" style={{color:'var(--danger)'}} onClick={()=>handleDelete(a)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <AdminModal admin={modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
      <style>{`.spin-anim { animation: spin 0.7s linear infinite; }`}</style>
    </Layout>
  );
}
