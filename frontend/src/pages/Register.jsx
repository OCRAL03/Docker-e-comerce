import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../lib/toast.jsx';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { add } = useToast();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8085/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'user', age: 25 })
      });
      if (response.ok) {
        add('¡Cuenta creada con éxito! Ahora inicia sesión.', 'success', 4000);
        navigate('/login');
      } else {
        setError('Error al registrarse. El email podría estar en uso.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-50 rounded-full mb-4">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Únete a OpsCenter</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input name="name" type="text" required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Juan Pérez" value={formData.name} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input name="email" type="email" required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="usuario@ejemplo.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input name="password" type="password" required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="••••••" value={formData.password} onChange={handleChange} />
            </div>
          </div>

          {error && (<div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center">{error}</div>)}

          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2" disabled={loading || !formData.name || !formData.email || !formData.password || formData.password.length < 6}>
            {loading ? 'Creando cuenta...' : 'Registrarse'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-200 pt-4">
          <span className="text-sm text-slate-600">¿Ya tienes cuenta?</span>{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
