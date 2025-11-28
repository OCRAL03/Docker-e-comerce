import React from 'react';
import { Link } from 'react-router-dom';
import ArchitectureStatus from './ArchitectureStatus.jsx';
import { isAdminFromToken, decodeJwt } from '../lib/auth.js';
import { LayoutDashboard, Users, CheckSquare, Activity, Mail, ShoppingCart, Package } from 'lucide-react';

export default function Layout({ children, headers, cartCount=0 }){
  const token = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('token') || '' : '';
  const isAdmin = isAdminFromToken(token);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily:'Inter, system-ui, sans-serif' }}>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-4 sticky top-0 h-screen">
          <div className="font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-indigo-600 font-bold text-xl"><LayoutDashboard /><span>OpsCenter</span></span>
            {isAdmin && (
              <span className="text-xs px-2 py-1 rounded bg-slate-900 text-white">ADMIN</span>
            )}
          </div>
          <div className="mb-6 px-2">
            {token && (() => {
              const p = decodeJwt(token) || {};
              const username = p.preferred_username || p.username || p.email || p.sub || 'Usuario';
              const roles = p.roles || []; const role = p.role || '';
              const isAdm = (String(role).toLowerCase()==='admin') || (Array.isArray(roles) && roles.map(r=>String(r).toLowerCase()).includes('admin'));
              return (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {String(username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{username}</span>
                    {isAdm && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-emerald-200">Administrator</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
          <nav className="flex flex-col gap-2">
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/catalog"><CheckSquare size={18} /> Catálogo</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/cart"><ShoppingCart size={18} /> Carrito {cartCount>0 && <span className="ml-auto text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">{cartCount}</span>}</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/orders"><Package size={18} /> Mis Órdenes</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/users"><Users size={18} /> Usuarios</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/tasks"><CheckSquare size={18} /> Tareas</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/monitor"><Activity size={18} /> Monitor Sistema</Link>
            {isAdmin && (
              <>
                <a className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" href="http://localhost:8025" target="_blank" rel="noreferrer"><Mail size={18} /> MailHog</a>
                <a className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" href="http://localhost:3000" target="_blank" rel="noreferrer"><Activity size={18} /> Grafana</a>
                <Link className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2" to="/admin/orders"><Activity size={18} /> Órdenes (Admin)</Link>
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <ArchitectureStatus headers={headers} />
    </div>
  );
}
