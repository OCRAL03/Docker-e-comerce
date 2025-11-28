import React, { useEffect, useState } from 'react';
import { get } from '../lib/api';
import { decodeJwt } from '../lib/auth.js';
import { Package, Clock } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-slate-100 text-slate-600',
  COMPLETED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-amber-100 text-amber-800',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

export default function OrderHistory(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const info = decodeJwt(token) || {};
    const identifier = info.email || info.username || info.preferred_username || info.sub || '';
    (async () => {
      try {
        const r = await get(`/orders/user/${encodeURIComponent(identifier)}`);
        const arr = Array.isArray(r.data) ? r.data : [];
        arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(arr);
      } finally { setLoading(false); }
    })();
  }, []);
  if (loading) return (
    <div className="p-8 space-y-4 max-w-4xl mx-auto">
      {[1,2,3].map(i => (<div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />))}
    </div>
  );
  if (orders.length === 0) return (
    <div className="text-center py-20 text-slate-500">
      <Package size={48} className="mx-auto mb-4 opacity-50" />
      <p>No tienes órdenes registradas.</p>
    </div>
  );
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Package className="text-indigo-600" /> Mis Órdenes
      </h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 p-4 flex flex-wrap gap-4 justify-between items-center text-sm border-b border-slate-100">
              <div className="flex gap-6">
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold">Fecha</span>
                  <span className="font-medium text-slate-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold">Total</span>
                  <span className="font-medium text-slate-900">${Number(order.totalAmount||0).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">ID: {(order.id||'').toString().substring(0,8)}...</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-transparent ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  <Clock size={12} /> {order.status || 'COMPLETED'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-slate-100">
                {(order.items||[]).map((item, idx) => (
                  <li key={idx} className="py-2 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded"><Package size={16} className="text-slate-400"/></div>
                      <div>
                        <p className="font-medium text-slate-800">{item.productName || `Producto ID: ${item.productId}`}</p>
                        <p className="text-xs text-slate-500">Cant: {item.quantity} x ${Number(item.price||0).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
