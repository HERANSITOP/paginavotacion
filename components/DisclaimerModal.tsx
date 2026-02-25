"use client";

import { useState } from "react";

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ open, onClose }: DisclaimerModalProps) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="disclaimer-title">DISCLAIMER LEGAL</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>1. Carácter no vinculante:</strong> Los resultados de esta votación tienen carácter
            exclusivamente informativo y no constituyen, por sí mismos, una decisión oficial sobre el
            mecanismo a adoptar, salvo validación expresa en asamblea.
          </p>
          <p>
            <strong>2. No afiliación institucional:</strong> Este sitio web es una iniciativa independiente
            y no está afiliado, administrado, respaldado ni representa oficialmente a la Universidad
            Nacional de Colombia.
          </p>
          <p>
            <strong>3. Uso voluntario:</strong> La participación en esta plataforma es voluntaria y su
            utilización implica la aceptación de este aviso.
          </p>
          <p>
            <strong>4. Disponibilidad del servicio:</strong> No se garantiza la disponibilidad continua,
            ausencia de errores o ininterrupción del servicio.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-modal" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
