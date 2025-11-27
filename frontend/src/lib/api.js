const API = 'http://localhost:8085';
const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (() => {
  const mem = {};
  return { getItem: (k) => mem[k] || '', setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
})();
let token = storage.getItem('token') || '';
export const setToken = (t) => { token = t || ''; if (t) storage.setItem('token', t); else storage.removeItem('token'); };
const auth = () => token ? { Authorization: `Bearer ${token}` } : {};
export const get = async (path) => {
  const r = await fetch(`${API}${path}`, { headers: { ...auth() } });
  const data = await r.json();
  return { data, headers: r.headers };
};
export const post = (path, body) => fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(body) }).then(r => r.json());
export const patch = (path, body) => fetch(`${API}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(body) }).then(r => r.json());
export const del = (path) => fetch(`${API}${path}`, { method: 'DELETE', headers: { ...auth() } }).then(r => r.text());
export const login = (email, password) => fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(r => r.json());
export const logout = () => fetch(`${API}/auth/logout`, { method: 'POST', headers: { ...auth() } });
