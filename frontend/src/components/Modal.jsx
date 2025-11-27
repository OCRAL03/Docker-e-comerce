import React from 'react';
export default function Modal({ open, text, onCancel, onConfirm }){
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-body">{text}</div>
        <div className="row">
          <button onClick={onConfirm}>Confirmar</button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
