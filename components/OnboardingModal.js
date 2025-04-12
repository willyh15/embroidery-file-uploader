import { useEffect, useState } from "react";

export default function OnboardingModal({ onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Welcome to the Embroidery Uploader!</h2>

        <ul className="list-disc list-inside text-gray-700 text-sm mb-4">
          <li>Upload PNG, JPG, or SVG designs.</li>
          <li>Click "Convert" to generate PES files.</li>
          <li>Monitor real-time progress with status badges.</li>
          <li>Use filters and pagination to organize files.</li>
          <li>Access stitch previews and recent activity.</li>
        </ul>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
