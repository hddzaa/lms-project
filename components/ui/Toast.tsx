"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export default function Toast({
  open,
  onClose,
  title = "Berhasil!",
  message = "Perubahan berhasil disimpan",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="animate-slide-in-right fixed right-6 top-6 z-50 flex w-80 items-start gap-3 rounded-2xl border border-border bg-[#1a1c22] p-4 shadow-2xl">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
        <CheckCircle2 size={18} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{message}</p>
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
        <X size={16} />
      </button>
    </div>
  );
}