import React, { useEffect, useState } from 'react';
import { post, patch, del } from '../lib/api';
import { useToast } from '../lib/toast.jsx';
import Modal from './Modal.jsx';
import { Zap, Mail } from 'lucide-react';

export default function Tasks({ users, tasks, onChanged, source }){
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, task: null });
  const toast = useToast();
  const create = async () => {
    try {
      setLoading(true);
      toast.add(
        (
          <div className="flex flex-col gap-1">
            <span>Tarea encolada correctamente</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Zap size={12} className="text-amber-500" />
              Enviando evento asíncrono a RabbitMQ para notificar...
            </span>
          </div>
        ),
        'info',
        4000
      );
      await post('/tasks', { title });
      setTitle('');
      onChanged();
    } catch {
      toast.add('Error al crear tarea', 'error');
    } finally {
      setLoading(false);
    }
  };
  const toggle = async (t) => {
    try { setLoading(true); await patch(`/tasks/${t.id || t._id}`, { completed: !t.completed }); onChanged(); }
    catch { toast.add('Error al actualizar tarea', 'error'); }
    finally { setLoading(false); }
  };
  const startEdit = (t) => { setEditingId(t.id || t._id); setEditTitle(t.title); };
  const saveEdit = async (t) => {
    try { setLoading(true); await patch(`/tasks/${t.id || t._id}`, { title: editTitle }); setEditingId(''); setEditTitle(''); onChanged(); toast.add('Tarea actualizada', 'success'); }
    catch { toast.add('Error al actualizar tarea', 'error'); }
    finally { setLoading(false); }
  };
  const remove = async (t) => {
    setConfirm({ open: true, task: t });
  };
  const doRemove = async () => {
    const t = confirm.task; setConfirm({ open: false, task: null });
    try { setLoading(true); await del(`/tasks/${t.id || t._id}`); onChanged(); toast.add('Tarea eliminada', 'success'); }
    catch { toast.add('Error al eliminar tarea', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const saved = localStorage.getItem('tasks_filter');
    if (saved) setFilter(saved);
  }, []);
  useEffect(() => { localStorage.setItem('tasks_filter', filter); }, [filter]);
  const filtered = tasks.filter(t => filter==='all' || (filter==='completed'? t.completed : !t.completed));
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-900 font-semibold">Tareas</h2>
        {source && (
          <span className={`text-xs px-2 py-1 rounded border ${source==='redis' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {source==='redis' ? 'REDIS CACHE' : 'MONGODB'}
          </span>
        )}
      </div>
      <div className="row">
        <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <button onClick={create} disabled={loading}>Crear</button>
      </div>
      <div className="row">
        <button className={filter==='all'?'active':''} onClick={() => setFilter('all')}>Todas</button>
        <button className={filter==='pending'?'active':''} onClick={() => setFilter('pending')}>Pendientes</button>
        <button className={filter==='completed'?'active':''} onClick={() => setFilter('completed')}>Completadas</button>
      </div>
      <ul>
        {filtered.map(t => {
          const u = users.find(x => (x.id || x._id) === t.userId);
          const by = u ? `${u.name} (${u.email})` : t.userId;
          const id = t.id || t._id;
          return (
            <li key={id}>
              {editingId === id ? (
                <>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  <button onClick={() => saveEdit(t)}>Guardar</button>
                  <button onClick={() => { setEditingId(''); setEditTitle(''); }}>Cancelar</button>
                </>
              ) : (
                <>
                  {t.title} · {by} · {t.completed ? '✔' : '✖'} {t.completed && <Mail size={14} className="inline text-slate-400" />}
                  <button onClick={() => toggle(t)}>{t.completed ? 'Desmarcar' : 'Completar'}</button>
                  <button onClick={() => startEdit(t)}>Editar</button>
                  <button onClick={() => remove(t)}>Eliminar</button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <Modal open={confirm.open} text="¿Eliminar esta tarea?" onCancel={() => setConfirm({ open:false, task:null })} onConfirm={doRemove} />
    </div>
  );
}
