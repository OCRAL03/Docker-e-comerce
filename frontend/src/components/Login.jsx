import React, { useState } from 'react';
import { login } from '../lib/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const validEmail = email.includes('@');
  const valid = validEmail && password.length >= 1;
  const submit = async () => {
    setError('');
    if (!valid) { setError('Email y contraseña requeridos'); return; }
    setLoading(true);
    try {
      const r = await login(email, password);
      if (r && r.token) onLogin(r.token); else setError('Credenciales inválidas');
    } catch { setError('Error de autenticación'); }
    finally { setLoading(false); }
  };
  return (
    <div className="card">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={submit} disabled={!valid || loading}>Entrar</button>
    </div>
  );
}
