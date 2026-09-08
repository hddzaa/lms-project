"use client";

import { useEffect, useState } from "react";
import { ChevronDown, AlertCircle, User, BookMarked, Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { MataPelajaran } from "@/lib/dummy-data";

type FormErrors = { nama?: string };

export default function MapelModal({
  open,
  onClose,
  onSubmit,
  initialData,
  guruOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MataPelajaran, "id">) => void;
  initialData?: MataPelajaran | null;
  guruOptions: string[];
}) {
  const [nama, setNama] = useState("");
  const [guru, setGuru] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setNama(initialData?.nama ?? "");
      setGuru(initialData?.guruPengampu ?? "");
      setErrors({});
    }
  }, [open, initialData]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!nama.trim()) e.nama = "Nama mata pelajaran wajib diisi";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({ nama, guruPengampu: guru || "Belum ditentukan" });
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <h3 className="text-xl font-semibold text-white">
        {isEdit ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
      </h3>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-gray-300">Nama Mata Pelajaran</label>
        <div className="relative">
          <BookMarked size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={nama}
            onChange={(e) => {
              setNama(e.target.value);
              if (errors.nama) setErrors({});
            }}
            type="text"
            placeholder="Contoh: Matematika Lanjut"
            className={`w-full rounded-xl border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${
              errors.nama ? "border-red-500/60" : "border-border focus:border-primary/50"
            }`}
          />
        </div>
        {errors.nama && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> {errors.nama}</p>}

        <label className="mb-1.5 mt-4 block text-sm font-medium text-gray-300">Guru Pengampu</label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <select
            value={guru}
            onChange={(e) => setGuru(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-black/30 py-2.5 pl-10 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            <option value="">Pilih Guru Pengampu...</option>
            {guruOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
          <Info size={13} className="mt-0.5 shrink-0" />
          Anda dapat mengubah ini nanti dari dashboard Manajemen Guru.
        </p>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
            Batal
          </button>
          <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-bg transition-transform hover:scale-105">
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
}