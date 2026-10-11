"use client";

import { useState } from "react";
import { UploadCloud, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { downloadTemplateSiswa } from "@/lib/export";

type ImportResult = { berhasil: number; gagal: number; errors: string[] };

export default function ImportSiswaModal({
  open,
  onClose,
  kelasId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  kelasId: string;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleClose() {
    setFile(null);
    setResult(null);
    onClose();
  }

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const res = await fetch(`/api/kelas/${kelasId}/siswa/import`, { method: "POST", body: formData });
    const data: ImportResult = await res.json();
    setUploading(false);
    setResult(data);
    if (data.berhasil > 0) onImported();
  }

  return (
    <Modal open={open} onClose={handleClose} maxWidth="max-w-lg">
      <h3 className="text-xl font-semibold text-white">Import Siswa dari Excel</h3>
      <p className="mt-1.5 text-sm text-muted">Upload file Excel berisi banyak siswa sekaligus.</p>

      <button
        type="button"
        onClick={downloadTemplateSiswa}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-black/20 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
      >
        <Download size={15} /> Download Template Excel
      </button>

      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
          className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary-soft" : "border-border"
          }`}
        >
          <UploadCloud size={28} className="mb-2 text-primary" />
          <p className="text-sm text-gray-200">{file ? file.name : "Seret file .xlsx ke sini"}</p>
          <label className="mt-3 cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/5">
            Pilih File
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={16} /> {result.berhasil} siswa berhasil ditambahkan
          </div>
          {result.gagal > 0 && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <div className="flex items-center gap-2"><AlertCircle size={16} /> {result.gagal} baris gagal</div>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-red-400">
                {result.errors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
        <button onClick={handleClose} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
          {result ? "Tutup" : "Batal"}
        </button>
        {!result && (
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
          >
            {uploading ? "Mengimpor..." : "Import Sekarang"}
          </button>
        )}
      </div>
    </Modal>
  );
}