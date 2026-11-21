"use client";

import Modal from "./Modal";
import { Send, CheckCircle2 } from "lucide-react";

export default function ConfirmSubmitModal({
  open,
  onClose,
  onConfirm,
  title = "Kumpulkan Assessment?",
  message = "Pastikan semua jawaban sudah terisi. Anda tidak bisa mengubahnya lagi setelah dikumpulkan.",
  confirmLabel = "Ya, Kumpulkan",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full bg-white/5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            Periksa Lagi
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Send size={15} /> {loading ? "Mengirim..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}