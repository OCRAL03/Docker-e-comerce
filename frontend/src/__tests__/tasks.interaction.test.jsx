import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { ToastProvider } from '../lib/toast.jsx';
import Tasks from '../components/Tasks.jsx';

vi.mock('../lib/api', () => ({
  post: vi.fn(async () => ({ id: 't1', title: 'Nueva', userId: 'u1', completed: false })),
  patch: vi.fn(async () => ({})),
  del: vi.fn(async () => ({})),
}));

describe('Tasks interactions', () => {
  let users, tasks, onChanged;
  beforeEach(() => { users = [{ id:'u1', name:'Ana', email:'ana@example.com' }]; tasks = [{ id:'a', title:'Tarea', userId:'u1', completed:false }]; onChanged = vi.fn(); });

  it('filters pending and completed', () => {
    render(<ToastProvider><Tasks users={users} tasks={[...tasks, { id:'b', title:'Hecha', userId:'u1', completed:true }]} onChanged={onChanged} /></ToastProvider>);
    fireEvent.click(screen.getByText('Pendientes'));
    expect(screen.getAllByRole('listitem').length).toBe(1);
    fireEvent.click(screen.getByText('Completadas'));
    expect(screen.getAllByRole('listitem').length).toBe(1);
  });

  it('opens modal and confirms delete', async () => {
    render(<ToastProvider><Tasks users={users} tasks={tasks} onChanged={onChanged} /></ToastProvider>);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(screen.getByText('¿Eliminar esta tarea?')).toBeTruthy();
    fireEvent.click(screen.getByText('Confirmar'));
    await waitFor(() => expect(api.del).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.getByText('Tarea eliminada')).toBeTruthy();
  });
});
