import React, { useState } from 'react';
import { login } from '../lib/api';
import { useToast } from '../lib/toast.jsx';
import { LayoutDashboard, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { add } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const emailInput = username.includes('@') ? username : `${username}@ops.local`;
      const r = await login(emailInput, password);
      if (r && r.token) { add('Bienvenido', 'success'); onLogin(r.token); } else { setError('Credenciales incorrectas (Prueba: admin / admin)'); }
    } catch (err) {
      setError('Credenciales incorrectas (Prueba: admin / admin)');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-50 rounded-full mb-4">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">OpsCenter</h1>
          <p className="text-slate-500 text-sm mt-1">Plataforma de Arquitectura Distribuida</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-200 pt-4">
          <span className="text-sm text-slate-600">¿No tienes cuenta?</span>{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Crear cuenta</Link>
        </div>
      </div>
    </div>
  );
}
