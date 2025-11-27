import React, { useEffect, useState } from 'react';
import './styles.css';
import Login from './components/Login';
import Users from './components/Users';
import Tasks from './components/Tasks';
import { get, logout as apiLogout, setToken as apiSetToken } from './lib/api';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Monitor from './components/Monitor.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lastHeaders, setLastHeaders] = useState(null);
  const [usersSource, setUsersSource] = useState('');
  const [tasksSource, setTasksSource] = useState('');

  const load = async () => {
    const u = await get('/users');
    setUsers(u.data); setLastHeaders(u.headers); setUsersSource(u.headers.get('x-data-source') || '');
    const t = await get('/tasks');
    setTasks(t.data); setLastHeaders(t.headers); setTasksSource(t.headers.get('x-data-source') || '');
  };
  useEffect(() => { if(token) load(); }, [token]);

  const logout = async () => {
    await apiLogout();
    apiSetToken(''); setToken(''); setUsers([]); setTasks([]);
  };
  const onLogin = async (t) => { apiSetToken(t); setToken(t); await load(); };

  return (
    <div className="app">
      <h1 className="sr-only">Proyecto</h1>
      <Layout headers={lastHeaders}>
        <div className="flex justify-end mb-4">
          {token && <button onClick={logout} className="px-3 py-2 bg-slate-900 text-white rounded">Logout</button>}
        </div>
        <Routes>
          <Route path="/users" element={token ? (<Users users={users} onChanged={load} source={usersSource} />) : (<Login onLogin={onLogin} />)} />
          <Route path="/tasks" element={token ? (<Tasks users={users} tasks={tasks} onChanged={load} source={tasksSource} />) : (<Login onLogin={onLogin} />)} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="*" element={<Navigate to="/users" />} />
        </Routes>
      </Layout>
    </div>
  );
}
