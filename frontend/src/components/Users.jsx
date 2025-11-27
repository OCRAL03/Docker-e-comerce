import React, { useState } from 'react';
import { post } from '../lib/api';
import { useToast } from '../lib/toast.jsx';

export default function Users({ users, onChanged, source }){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const create = async () => {
    if (!name.trim() || !email.includes('@')) { toast.add('Nombre y email válidos requeridos', 'error'); return; }
    try {
      setLoading(true);
      await post('/users', { name, email });
      toast.add('Usuario creado', 'success');
      setName(''); setEmail(''); onChanged();
    } catch {
      toast.add('Error al crear usuario', 'error');
    } finally { setLoading(false); }
  };
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-900 font-semibold">Usuarios</h2>
        {source && (
          <span className={`text-xs px-2 py-1 rounded border ${source==='redis' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {source==='redis' ? 'Datos Cacheados' : 'Datos Frescos'}
          </span>
        )}
      </div>
      <ul>{users.map(u => <li key={u.id || u._id}>{u.name} - {u.email}</li>)}</ul>
      <div className="row">
        <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={create} disabled={loading}>Crear</button>
      </div>
    </div>
  );
}
