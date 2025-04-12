import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

export default function StitchPreviewModal({ pesUrl, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pesUrl) return;
    const fetchPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pesUrl }),
        });
        const data = await res.json();
        if (!res.ok || !data.previewUrl) throw new Error("Preview generation failed");
        setPreviewUrl(data.previewUrl);
      } catch (err) {
        console.error("Preview error:", err);
        setError("Failed to load preview.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [pesUrl]);

  return (
    <Dialog open={!!pesUrl} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="bg-white w-full max-w-3xl p-6 mx-auto rounded-lg shadow-xl relative z-10">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">Stitch Preview</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading && <p className="text-blue-500 animate-pulse">Generating preview...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Stitch Preview"
              className="w-full h-auto border border-gray-300 rounded"
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
