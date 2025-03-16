import { useState } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        <div>{children}</div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}