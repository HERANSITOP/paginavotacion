"use client";

import { useState } from "react";
import DisclaimerModal from "./DisclaimerModal";

/** Title row with Disclaimer button (client interaction) */
export default function HomeClient() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="title-row">
        <h1>Votación UNAL</h1>
        <span className="site-badge">⬤ Sede Medellín</span>
        <button
          type="button"
          className="disclaimer-badge"
          onClick={() => setModalOpen(true)}
        >
          DISCLAIMER
        </button>
      </div>
      <DisclaimerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
