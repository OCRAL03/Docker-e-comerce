import React, { useEffect, useState } from 'react';
import './styles.css';
import Login from './components/Login';
import Register from './pages/Register.jsx';
import Users from './components/Users';
import Tasks from './components/Tasks';
import { get, logout as apiLogout, setToken as apiSetToken } from './lib/api';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Monitor from './components/Monitor.jsx';
import Catalog from './components/Catalog.jsx';
import Cart from './components/Cart.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import AdminOrders from './components/AdminOrders.jsx';
import { isAdminFromToken } from './lib/auth.js';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lastHeaders, setLastHeaders] = useState(null);
  const [usersSource, setUsersSource] = useState('');
  const [tasksSource, setTasksSource] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopping-cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('shopping-cart', JSON.stringify(cart)); } catch {} }, [cart]);

  const load = async () => {
    setLoadingUsers(true);
    const u = await get('/users');
    setUsers(u.data); setLastHeaders(u.headers); setUsersSource(u.headers.get('x-data-source') || '');
    setLoadingUsers(false);
    setLoadingTasks(true);
    const t = await get('/tasks');
    setTasks(t.data); setLastHeaders(t.headers); setTasksSource(t.headers.get('x-data-source') || '');
    setLoadingTasks(false);
  };
  useEffect(() => { if(token) load(); }, [token]);

  const logout = async () => {
    await apiLogout();
    apiSetToken(''); setToken(''); setUsers([]); setTasks([]); setCart([]);
  };
  const onLogin = async (t) => { apiSetToken(t); setToken(t); await load(); };

  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === (product.id || product._id));
      if (idx >= 0) {
        const copy = [...prev]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }; return copy;
      }
      return [...prev, { id: product.id || product._id, name: product.name, price: product.price || 0, qty: 1 }];
    });
  };
  const updateCartQty = (id, qty) => { setCart(prev => prev.map(i => i.id===id ? { ...i, qty: Math.max(1, qty) } : i)); };
  const removeFromCart = (id) => { setCart(prev => prev.filter(i => i.id !== id)); };
  const clearCart = () => { setCart([]); };

  return (
    <div className="app">
      <h1 className="sr-only">Proyecto</h1>
      {!token ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Layout headers={lastHeaders} cartCount={cart.reduce((a,b)=>a+b.qty,0)}>
          <div className="flex justify-end mb-4">
            <button onClick={logout} className="px-3 py-2 bg-slate-900 text-white rounded">Logout</button>
          </div>
          <Routes>
            <Route path="/users" element={isAdminFromToken(token) ? <Users users={users} onChanged={load} source={usersSource} loadingList={loadingUsers} /> : <Navigate to="/catalog" />} />
            <Route path="/tasks" element={<Tasks users={users} tasks={tasks} onChanged={load} source={tasksSource} loadingList={loadingTasks} />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/catalog" element={<Catalog onAddToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail onAddToCart={addToCart} />} />
            <Route path="/cart" element={<Cart items={cart} onQty={updateCartQty} onRemove={removeFromCart} onClear={clearCart} />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin/orders" element={isAdminFromToken(token) ? <AdminOrders /> : <Navigate to="/catalog" />} />
            <Route path="*" element={<Navigate to="/catalog" />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
}
