"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { FileSpreadsheet, FileCode, Download } from "lucide-react";

export default function DownloadRekapModal({
  open,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (format: "xlsx" | "csv") => void;
  title: string;
}) {
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-muted">Pilih format file untuk mengunduh data</p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setFormat("xlsx")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
            format === "xlsx" ? "border-primary/50 bg-primary-soft" : "border-border bg-black/20 hover:bg-white/5"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <FileSpreadsheet size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Excel (.xlsx)</p>
            <p className="mt-0.5 text-xs text-muted">Format spreadsheet standar dengan styling dan sheet terpisah.</p>
          </div>
          <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${format === "xlsx" ? "border-primary bg-primary" : "border-gray-500"}`} />
        </button>

        <button
          type="button"
          onClick={() => setFormat("csv")}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
            format === "csv" ? "border-primary/50 bg-primary-soft" : "border-border bg-black/20 hover:bg-white/5"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-300">
            <FileCode size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">CSV (.csv)</p>
            <p className="mt-0.5 text-xs text-muted">Data mentah dipisahkan koma, ringan dan mudah diintegrasikan.</p>
          </div>
          <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${format === "csv" ? "border-primary bg-primary" : "border-gray-500"}`} />
        </button>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
        <button onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
          Batal
        </button>
        <button
          onClick={() => onConfirm(format)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-bg transition-transform hover:scale-105"
        >
          <Download size={15} /> Download
        </button>
      </div>
    </Modal>
  );
}