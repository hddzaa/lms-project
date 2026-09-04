"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

export default function SuccessModal({
  open,
  onClose,
  message = "Perubahan berhasil disimpan",
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="animate-slide-in-right w-80 rounded-2xl border border-primary/20 bg-[#1a1c22] p-6 text-center shadow-2xl shadow-primary/10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"
        >
          <X size={16} />
        </button>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
          <Check size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Berhasil!</h3>
        <p className="mt-1 text-sm text-muted">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-primary py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary/90"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}