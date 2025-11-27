export function decodeJwt(token){
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch { return null; }
}

export function isAdminFromToken(token){
  const p = decodeJwt(token);
  if (!p) return false;
  if (p.role && String(p.role).toLowerCase() === 'admin') return true;
  if (Array.isArray(p.roles) && p.roles.map(r => String(r).toLowerCase()).includes('admin')) return true;
  if (p.isAdmin === true) return true;
  return false;
}

