"use client";

import Modal from "./Modal";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  itemLabel = "data ini",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Konfirmasi Hapus</h3>
        <p className="mt-2 text-sm text-muted">
          Apa anda yakin ingin menghapus {itemLabel}?
        </p>
        <div className="mt-6 flex w-full gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-white/5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            <Trash2 size={15} /> Ya
          </button>
        </div>
      </div>
    </Modal>
  );
}