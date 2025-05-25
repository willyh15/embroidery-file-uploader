// components/OnboardingModal.js
import { useEffect, useState } from "react";

export default function OnboardingModal({ onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 15000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
      <div className="glass-modal p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-[var(--primary-text)]">
          Welcome!
        </h2>
        <ul className="list-disc list-inside space-y-2 mb-4 text-[var(--primary-text)]">
          <li>Upload PNG, JPG or SVG designs.</li>
          <li>Click “Convert” to generate PES files.</li>
          <li>Watch real-time status badges.</li>
          <li>Filter and page through your uploads.</li>
          <li>Preview your stitches and review activity.</li>
        </ul>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}