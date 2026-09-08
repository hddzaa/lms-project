"use client";

import { useEffect, useState } from "react";
import { ChevronDown, UserPlus, AlertCircle, IdCard, Mail, BookOpen } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Guru } from "@/lib/dummy-data";

type FormErrors = { nama?: string; nip?: string; email?: string; mapel?: string };

export default function GuruModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mapelOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Guru, "id">) => void;
  initialData?: Guru | null;
  mapelOptions: string[];
}) {
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [mapel, setMapel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      setNama(initialData?.nama ?? "");
      setNip(initialData?.nip ?? "");
      setEmail(initialData?.email ?? "");
      setMapel(initialData?.mapel ?? "");
      setErrors({});
    }
  }, [open, initialData]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!nama.trim()) e.nama = "Nama lengkap wajib diisi";
    if (!nip.trim()) e.nip = "NIP wajib diisi";
    if (!email.trim()) e.email = "Email wajib diisi";
    if (!mapel) e.mapel = "Mata pelajaran wajib dipilih";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit({ nama, nip, email, mapel });
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="mb-6 flex items-start gap-3">
        {!isEdit && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft">
            <UserPlus size={20} className="text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">
            {isEdit ? "Edit Guru" : "Tambah Guru Baru"}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {isEdit ? "Perbarui informasi tenaga pendidik." : "Masukkan detail informasi tenaga pendidik."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">Nama Lengkap</label>
        <input
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            if (errors.nama) setErrors((p) => ({ ...p, nama: undefined }));
          }}
          type="text"
          placeholder="Contoh: Dr. Budi Santoso, M.Pd"
          className={`w-full rounded-xl border bg-black/30 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none ${
            errors.nama ? "border-red-500/60" : "border-border focus:border-primary/50"
          }`}
        />
        {errors.nama && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> {errors.nama}</p>}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">NIP</label>
            <div className="relative">
              <IdCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={nip}
                onChange={(e) => {
                  setNip(e.target.value);
                  if (errors.nip) setErrors((p) => ({ ...p, nip: undefined }));
                }}
                type="text"
                placeholder="18 digit angka"
                className={`w-full rounded-xl border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${
                  errors.nip ? "border-red-500/60" : "border-border focus:border-primary/50"
                }`}
              />
            </div>
            {errors.nip && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> {errors.nip}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Email Akademik</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                type="email"
                placeholder="guru@aetheris.edu"
                className={`w-full rounded-xl border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${
                  errors.email ? "border-red-500/60" : "border-border focus:border-primary/50"
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> {errors.email}</p>}
          </div>
        </div>

        <label className="mb-1.5 mt-4 block text-sm font-medium text-gray-300">Mata Pelajaran Utama</label>
        <div className="relative">
          <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <select
            value={mapel}
            onChange={(e) => {
              setMapel(e.target.value);
              if (errors.mapel) setErrors((p) => ({ ...p, mapel: undefined }));
            }}
            className={`w-full appearance-none rounded-xl border bg-black/30 py-2.5 pl-10 pr-9 text-sm text-gray-200 outline-none ${
              errors.mapel ? "border-red-500/60" : "border-border focus:border-primary/50"
            }`}
          >
            <option value="" disabled>Pilih mata pelajaran pengampu...</option>
            {mapelOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>
        {errors.mapel && <p className="mt-1 flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> {errors.mapel}</p>}

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