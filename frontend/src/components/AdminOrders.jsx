import React, { useEffect, useState } from 'react';
import { get, patch } from '../lib/api';
import { isAdminFromToken } from '../lib/auth.js';
import { useToast } from '../lib/toast.jsx';

export default function AdminOrders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const statusOptions = ['PENDING','COMPLETED','SHIPPED','DELIVERED','CANCELLED'];
  const statusColors = {
    PENDING: 'bg-slate-100 text-slate-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-amber-100 text-amber-800',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  const toast = useToast();
  const load = async () => { setLoading(true); const r = await get('/orders'); setOrders(Array.isArray(r.data)? r.data:[]); setLoading(false); };
  useEffect(() => { load(); }, []);
  const onStatusChange = async (id, status) => {
    setSavingId(id);
    await patch(`/orders/${id}/status`, { status });
    setSavingId('');
    await load();
    toast.add('Estado actualizado', 'success');
  };
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <h2 className="text-slate-900 font-semibold mb-4">Órdenes (Admin)</h2>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
          <div className="h-6 bg-slate-200 rounded" />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">ID</th>
              <th className="py-2">Usuario</th>
              <th className="py-2">Total</th>
              <th className="py-2">Fecha</th>
              <th className="py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="py-2 font-mono text-xs">{(o.id||'').substring(0,8)}...</td>
                <td className="py-2">{o.userId}</td>
                <td className="py-2">${Number(o.totalAmount||0).toFixed(2)}</td>
                <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                    <select className="border border-slate-300 rounded px-2 py-1" value={o.status||'PENDING'} onChange={e => onStatusChange(o.id, e.target.value)} disabled={savingId===o.id}>
                      {statusOptions.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
