import React, { useState } from 'react';
import { useToast } from '../lib/toast.jsx';
import { post } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { decodeJwt } from '../lib/auth.js';

export default function Cart({ items, onQty, onRemove, onClear }){
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = items.reduce((a,b)=> a + (Number(b.price||0) * Number(b.qty||1)), 0);
  const checkout = async () => {
    if (!items.length) { toast.add('Carrito vacío', 'info'); return; }
    setConfirmOpen(true);
  };
  const confirmCheckout = async () => {
    try {
      const info = decodeJwt(localStorage.getItem('token')||'') || {};
      const identifier = info.email || info.username || info.preferred_username || info.sub || '';
      const payload = { userId: identifier, items: items.map(i => ({ productId: i.id, productName: i.name, price: Number(i.price||0), quantity: i.qty })), totalAmount: total, status: 'COMPLETED' };
      await post('/orders', payload);
      toast.add('Orden procesada', 'success');
      if (onClear) onClear();
      setConfirmOpen(false);
      navigate('/catalog');
    } catch { toast.add('No se pudo procesar la orden', 'error'); }
  };
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 font-semibold">Carrito</h2>
        <div className="text-slate-700 font-semibold">Total: ${total.toFixed(2)}</div>
      </div>
      {!items.length ? (
        <div className="text-slate-500">No hay productos en el carrito</div>
      ) : (
        <ul className="space-y-2">
          {items.map(i => (
            <li key={i.id} className="flex items-center justify-between border border-slate-200 rounded p-2">
              <div>
                <div className="font-medium text-slate-900">{i.name}</div>
                <div className="text-slate-600 text-sm">${Number(i.price||0).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={i.qty} onChange={e => onQty(i.id, Number(e.target.value))} className="w-16 border border-slate-300 rounded px-2 py-1" />
                <button className="px-3 py-1 bg-slate-900 text-white rounded" onClick={() => onRemove(i.id)}>Quitar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end">
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded" onClick={checkout}>Checkout</button>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirmar compra</h3>
            <ul className="divide-y divide-slate-100 mb-4">
              {items.map(i => (
                <li key={i.id} className="py-2 flex justify-between">
                  <span className="text-slate-800 font-medium">{i.name}</span>
                  <span className="text-slate-600">{i.qty} x ${Number(i.price||0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600">Total</span>
              <span className="text-slate-900 font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded border border-slate-300 text-slate-700" onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded" onClick={confirmCheckout}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
