import React from 'react';
import { createContext, useContext, useState } from 'react';

const ToastCtx = createContext({ add: () => {} });
export function useToast(){ return useContext(ToastCtx); }

export function ToastProvider({ children }){
  const [items, setItems] = useState([]);
  const add = (content, tone='info', duration=3000) => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, content, tone }]);
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), duration);
  };
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="toast-wrap">
        {items.map(t => <div key={t.id} className={`toast ${t.tone}`}>{typeof t.content === 'string' ? t.content : t.content}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
