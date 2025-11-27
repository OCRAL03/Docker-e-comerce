import React from 'react';
import { Link } from 'react-router-dom';
import ArchitectureStatus from './ArchitectureStatus.jsx';

export default function Layout({ children, headers }){
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontFamily:'Inter, system-ui, sans-serif' }}>
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-4 sticky top-0 h-screen">
          <div className="font-semibold mb-4">DockStore</div>
          <nav className="flex flex-col gap-2">
            <Link className="px-3 py-2 rounded hover:bg-slate-100" to="/users">Usuarios</Link>
            <Link className="px-3 py-2 rounded hover:bg-slate-100" to="/tasks">Tareas</Link>
            <a className="px-3 py-2 rounded hover:bg-slate-100" href="http://localhost:8025" target="_blank" rel="noreferrer">MailHog</a>
            <a className="px-3 py-2 rounded hover:bg-slate-100" href="http://localhost:3000" target="_blank" rel="noreferrer">Grafana</a>
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

