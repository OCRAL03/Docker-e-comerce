const API = 'http://localhost:8085';
const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (() => {
  const mem = {};
  return { getItem: (k) => mem[k] || '', setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
})();
let token = storage.getItem('token') || '';
export const setToken = (t) => { token = t || ''; if (t) storage.setItem('token', t); else storage.removeItem('token'); };
const auth = () => token ? { Authorization: `Bearer ${token}` } : {};
export const get = async (path) => {
  try {
    const r = await fetch(`${API}${path}`, { headers: { ...auth() } });
    const ct = r.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await r.json() : await r.text();
    return { data, headers: r.headers, status: r.status };
  } catch (e) {
    return { data: null, headers: new Headers(), status: 0 };
  }
};
export const post = async (path, body) => {
  try {
    const r = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(body) });
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? await r.json() : await r.text();
  } catch (e) { return null; }
};
export const patch = async (path, body) => {
  try {
    const r = await fetch(`${API}${path}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(body) });
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? await r.json() : await r.text();
  } catch (e) { return null; }
};
export const del = async (path) => {
  try {
    const r = await fetch(`${API}${path}`, { method: 'DELETE', headers: { ...auth() } });
    return await r.text();
  } catch (e) { return '';
  }
};
export const login = (email, password) => fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(r => r.json());
export const logout = () => fetch(`${API}/auth/logout`, { method: 'POST', headers: { ...auth() } });
