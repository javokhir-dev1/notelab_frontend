import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Send, Trash2, Pin, Star, MoreVertical,
  NotebookPen, Loader, StickyNote, CheckSquare, FileText,
  Code2, Copy, Check, Edit3, X
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Sidebar from '../components/Sidebar';
import './NotebookChat.css';

// --------------- Type Config ---------------
const TYPES = [
  { key: 'text',      icon: <FileText size={13} />,     label: 'Matn' },
  { key: 'code',      icon: <Code2 size={13} />,        label: 'Kod' },
  { key: 'checklist', icon: <CheckSquare size={13} />,  label: 'Cheklis' },
  { key: 'markdown',  icon: <StickyNote size={13} />,   label: 'Markdown' },
];

const CODE_LANGS = [
  'javascript','typescript','python','java','c','cpp','csharp',
  'go','rust','php','ruby','sql','bash','json','html','css','yaml',
];

// --------------- Code Block ---------------
function CodeBlock({ content, lang = 'javascript' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block-wrap">
      <div className="code-block-header">
        <span className="code-lang-badge">{lang}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Nusxalandi!' : 'Nusxalash'}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 12px 12px',
          fontSize: '13px',
          lineHeight: '1.6',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
        showLineNumbers
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}

// --------------- Note Content Renderer ---------------
function NoteContent({ note }) {
  if (note.type === 'code') {
    // Format: first line can be language specifier like "```js" or just code
    let lang = 'javascript';
    let code = note.content;
    const firstLine = code.split('\n')[0].trim();
    if (firstLine.startsWith('```')) {
      const specified = firstLine.replace('```', '').trim().toLowerCase();
      if (specified && CODE_LANGS.includes(specified)) lang = specified;
      code = code.split('\n').slice(1).join('\n');
      if (code.endsWith('```')) code = code.slice(0, -3).trimEnd();
    }
    return <CodeBlock content={code} lang={lang} />;
  }

  if (note.type === 'checklist') {
    const items = note.content.split('\n').map((line, i) => {
      const isDone = line.startsWith('[x] ') || line.startsWith('[X] ');
      const text = line.replace(/^\[.?\] /, '');
      return (
        <div key={i} className="checklist-item">
          <span className={`check-box ${isDone ? 'done' : ''}`}>
            {isDone ? <Check size={11} /> : null}
          </span>
          <span style={{ textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'inherit' }}>
            {text}
          </span>
        </div>
      );
    });
    return <div className="checklist-wrap">{items}</div>;
  }

  return <p className="note-msg-text">{note.content}</p>;
}

// --------------- Note Message ---------------
function NoteMessage({ note, onDelete, onTogglePin, onToggleFav, onEdit }) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editLang, setEditLang] = useState('javascript');
  const [saving, setSaving] = useState(false);
  const menuRef = useRef();
  const editRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && editRef.current) editRef.current.focus();
  }, [editing]);

  const startEdit = () => {
    setMenu(false);
    // Extract raw content for editing
    let raw = note.content;
    let lang = 'javascript';
    if (note.type === 'code') {
      const firstLine = raw.split('\n')[0].trim();
      if (firstLine.startsWith('```')) {
        const specified = firstLine.replace('```', '').trim().toLowerCase();
        if (specified && CODE_LANGS.includes(specified)) lang = specified;
        raw = raw.split('\n').slice(1).join('\n');
        if (raw.endsWith('```')) raw = raw.slice(0, -3).trimEnd();
      }
    }
    setEditContent(raw);
    setEditLang(lang);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setEditContent(''); };

  const saveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    let finalContent = editContent.trim();
    if (note.type === 'code') {
      finalContent = `\`\`\`${editLang}\n${finalContent}\n\`\`\``;
    }
    try {
      await onEdit(note, finalContent);
      setEditing(false);
    } catch {
      toast.error('Saqlashda xato');
    } finally {
      setSaving(false);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && note.type !== 'code') {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') cancelEdit();
  };

  const time = new Date(note.createdAt).toLocaleTimeString('uz-UZ', {
    hour: '2-digit', minute: '2-digit'
  });

  const typeConf = TYPES.find(t => t.key === note.type) || TYPES[0];

  return (
    <div className={`note-msg ${note.is_pinned ? 'pinned' : ''} ${note.type === 'code' ? 'code-msg' : ''} ${editing ? 'editing' : ''}`}>
      <div className="note-msg-bubble">
        {editing ? (
          <div className="edit-mode">
            {note.type === 'code' && (
              <div className="edit-lang-row">
                <Code2 size={13} style={{ color: 'var(--accent)' }} />
                <select
                  className="code-lang-select"
                  value={editLang}
                  onChange={e => setEditLang(e.target.value)}
                >
                  {CODE_LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            <textarea
              ref={editRef}
              className={`edit-textarea ${note.type === 'code' ? 'code-edit-textarea' : ''}`}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
              placeholder="Tahrirlamoqda..."
              rows={note.type === 'code' ? 5 : 2}
              style={note.type === 'code' ? { fontFamily: "'Fira Code', monospace", fontSize: '13px' } : {}}
            />
            <div className="edit-actions">
              <span className="edit-hint">
                {note.type !== 'code' ? 'Enter — saqlash · Esc — bekor' : 'Esc — bekor'}
              </span>
              <button className="edit-cancel-btn" onClick={cancelEdit} disabled={saving}>
                <X size={13} /> Bekor
              </button>
              <button className="edit-save-btn" onClick={saveEdit} disabled={saving || !editContent.trim()}>
                {saving ? <Loader size={13} className="spin-anim" /> : <Check size={13} />}
                Saqlash
              </button>
            </div>
          </div>
        ) : (
          <NoteContent note={note} />
        )}
        <div className="note-msg-footer">
          <span className="note-msg-meta">
            {typeConf.icon} {typeConf.label}
          </span>
          {note._edited && (
            <span className="edited-badge">tahrirlandi</span>
          )}
          <span className="note-msg-time">{time}</span>
          {note.is_pinned && <Pin size={11} style={{ color: 'var(--accent)' }} />}
          {note.is_favorite && <Star size={11} style={{ color: 'var(--warning)' }} />}
        </div>
      </div>
      <div className="note-msg-actions" ref={menuRef}>
        <button className="note-action-btn" onClick={() => setMenu(p => !p)}>
          <MoreVertical size={14} />
        </button>
        {menu && (
          <div className="note-action-menu">
            <button onClick={startEdit}>
              <Edit3 size={13} /> Tahrirlash
            </button>
            <button onClick={() => { onTogglePin(note); setMenu(false); }}>
              <Pin size={13} /> {note.is_pinned ? 'Mahkamlashni olib tashlash' : 'Mahkamlash'}
            </button>
            <button onClick={() => { onToggleFav(note); setMenu(false); }}>
              <Star size={13} /> {note.is_favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
            </button>
            <button className="danger" onClick={() => { onDelete(note); setMenu(false); }}>
              <Trash2 size={13} /> O'chirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --------------- Code Input ---------------
function CodeInput({ value, onChange, lang, onLangChange }) {
  return (
    <div className="code-input-wrap">
      <div className="code-input-header">
        <Code2 size={14} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Dasturlash tili:</span>
        <select
          className="code-lang-select"
          value={lang}
          onChange={e => onLangChange(e.target.value)}
        >
          {CODE_LANGS.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <textarea
        className="chat-textarea code-textarea"
        placeholder={`// ${lang} kodi yozing...`}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={5}
        spellCheck={false}
        style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: '13px' }}
      />
    </div>
  );
}

// --------------- Main Component ---------------
export default function NotebookChat() {
  const { notebookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [codeLang, setCodeLang] = useState('javascript');
  const bottomRef = useRef();

  useEffect(() => {
    if (user && notebookId) fetchData();
  }, [user, notebookId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  // Reset content when switching type
  const handleTypeChange = (newType) => {
    setType(newType);
    setContent('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: nb } = await api.get(`/notebooks/user/${user.id}/notebook/${notebookId}`);
      setNotebook(nb);
      const { data: ns } = await api.get(`/notes/user/${user.id}/folder/${notebookId}`);
      setNotes(Array.isArray(ns) ? ns : []);
    } catch {
      toast.error('Yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    // For code type, wrap with language marker
    let finalContent = content.trim();
    if (type === 'code') {
      finalContent = `\`\`\`${codeLang}\n${finalContent}\n\`\`\``;
    }

    setSending(true);
    try {
      const { data } = await api.post('/notes', {
        user_id: user.id,
        notebook_id: Number(notebookId),
        content: finalContent,
        type,
        is_pinned: false,
        is_favorite: false,
      });
      setNotes(prev => [...prev, data]);
      setContent('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xato');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // Code type: always Shift+Enter for newline, Enter submits
    if (type !== 'code' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (note) => {
    try {
      await api.delete(`/notes/user/${user.id}/note/${note.id}`);
      setNotes(prev => prev.filter(n => n.id !== note.id));
      toast.success("O'chirildi");
    } catch { toast.error('Xato'); }
  };

  const handleTogglePin = async (note) => {
    try {
      await api.put(`/notes/user/${user.id}/note/${note.id}`, { ...note, is_pinned: !note.is_pinned });
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n));
    } catch { toast.error('Xato'); }
  };

  const handleToggleFav = async (note) => {
    try {
      await api.put(`/notes/user/${user.id}/note/${note.id}`, { ...note, is_favorite: !note.is_favorite });
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_favorite: !n.is_favorite } : n));
    } catch { toast.error('Xato'); }
  };

  const handleEdit = async (note, newContent) => {
    await api.put(`/notes/user/${user.id}/note/${note.id}`, {
      ...note,
      content: newContent,
    });
    setNotes(prev => prev.map(n =>
      n.id === note.id ? { ...n, content: newContent, _edited: true } : n
    ));
    toast.success('Tahrirlandi ✓');
  };

  const sortedNotes = [
    ...notes.filter(n => n.is_pinned),
    ...notes.filter(n => !n.is_pinned),
  ];

  return (
    <div className="chat-layout">
      <Sidebar />
      <div className="chat-page">

        {/* Header */}
        <div className="chat-header">
          <button className="btn-icon chat-back" onClick={() => navigate('/notebooks')}>
            <ArrowLeft size={18} />
          </button>
          <div className="chat-header-icon">
            <NotebookPen size={20} />
          </div>
          <div className="chat-header-info">
            <h1 className="chat-title">{notebook?.title || 'Daftar'}</h1>
            <span className="chat-subtitle">{notes.length} ta nota</span>
          </div>
          {notebook?.is_favorite && (
            <Star size={16} style={{ color: 'var(--warning)', marginLeft: 'auto' }} />
          )}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {loading ? (
            <div className="chat-loading">
              <div className="spinner" />
              <span>Yuklanmoqda...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">📝</div>
              <p className="chat-empty-title">Hozircha notalar yo'q</p>
              <p className="chat-empty-desc">Birinchi notangizni yozing...</p>
            </div>
          ) : (
            <>
              {notes.filter(n => n.is_pinned).length > 0 && (
                <div className="chat-pinned-label">
                  <Pin size={11} /> Mahkamlangan notalar
                </div>
              )}
              {sortedNotes.map((note, i) => {
                const prev = sortedNotes[i - 1];
                const showDate = !prev ||
                  new Date(note.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
                return (
                  <div key={note.id}>
                    {showDate && (
                      <div className="chat-date-divider">
                        {new Date(note.createdAt).toLocaleDateString('uz-UZ', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </div>
                    )}
                    <NoteMessage
                      note={note}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onToggleFav={handleToggleFav}
                      onEdit={handleEdit}
                    />
                  </div>
                );
              })}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-type-selector">
            {TYPES.map(t => (
              <button
                key={t.key}
                className={`type-btn ${type === t.key ? 'active' : ''}`}
                onClick={() => handleTypeChange(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form className="chat-input-col" onSubmit={handleSend}>
            {type === 'code' ? (
              <CodeInput
                value={content}
                onChange={setContent}
                lang={codeLang}
                onLangChange={setCodeLang}
              />
            ) : (
              <textarea
                className="chat-textarea"
                placeholder={
                  type === 'checklist'
                    ? '[ ] Vazifa 1\n[x] Bajarilgan vazifa\n[ ] Vazifa 3'
                    : 'Nota yozing... (Enter — yuborish, Shift+Enter — yangi qator)'
                }
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={type === 'checklist' ? 4 : 1}
                disabled={sending}
              />
            )}
            <div className="chat-input-row">
              <span className="chat-input-hint">
                {type === 'code'
                  ? 'Kod yozib tugmani bosing'
                  : type === 'checklist'
                  ? '[ ] = bajarilmagan, [x] = bajarilgan'
                  : 'Enter — yuborish · Shift+Enter — yangi qator'}
              </span>
              <button
                type="submit"
                className="chat-send-btn"
                disabled={sending || !content.trim()}
              >
                {sending ? <Loader size={18} className="spin-anim" /> : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
