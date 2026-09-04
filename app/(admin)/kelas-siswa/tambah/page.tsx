"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, AlertCircle } from "lucide-react";
import { guruList, addKelas } from "@/lib/dummy-data";
import SuccessModal from "@/components/ui/SuccessModal";

type FormErrors = {
  nama?: string;
  wali?: string;
  tahunAjaran?: string;
};

export default function TambahKelasPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [wali, setWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2023/2024");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!nama.trim()) newErrors.nama = "Nama kelas wajib diisi";
    if (!wali) newErrors.wali = "Wali kelas wajib dipilih";
    if (!tahunAjaran.trim()) newErrors.tahunAjaran = "Tahun ajaran wajib diisi";
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const parts = nama.trim().split(" ");
    const grade = parts[0].toUpperCase();
    const rest = parts.slice(1).join(" ") || nama;

    addKelas({
      grade: (["X", "XI", "XII"].includes(grade) ? grade : "X") as "X" | "XI" | "XII",
      name: rest,
      category: "Umum",
      waliKelas: wali,
      kapasitas: 36,
      tahunAjaran,
    });

    setShowSuccess(true);
  }

  return (
    <div>
      <span className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
        KELAS BARU
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      </span>
      <h1
        className="animate-fade-in-up text-3xl font-bold text-white"
        style={{ animationDelay: "40ms" }}
      >
        Tambah Kelas
      </h1>
      <p
        className="animate-fade-in-up mt-2 text-muted"
        style={{ animationDelay: "80ms" }}
      >
        Tambahkan kelas baru ke dalam sistem manajemen akademik.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "120ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">
          NAMA KELAS
        </label>
        <input
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            if (errors.nama) setErrors((prev) => ({ ...prev, nama: undefined }));
          }}
          type="text"
          placeholder="Contoh: XII IPA 1"
          className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${
            errors.nama
              ? "border-red-500/60 focus:border-red-500"
              : "border-border focus:border-primary/50"
          }`}
        />
        {errors.nama && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} /> {errors.nama}
          </p>
        )}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">
          WALI KELAS
        </label>
        <div className="relative">
          <select
            value={wali}
            onChange={(e) => {
              setWali(e.target.value);
              if (errors.wali) setErrors((prev) => ({ ...prev, wali: undefined }));
            }}
            className={`w-full appearance-none rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none ${
              errors.wali
                ? "border-red-500/60 focus:border-red-500"
                : "border-border focus:border-primary/50"
            }`}
          >
            <option value="" disabled>
              Pilih Guru Pengampu
            </option>
            {guruList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
        {errors.wali && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} /> {errors.wali}
          </p>
        )}

        <label className="mb-2 mt-6 block text-xs font-medium tracking-wide text-muted">
          TAHUN AJARAN
        </label>
        <input
          value={tahunAjaran}
          onChange={(e) => {
            setTahunAjaran(e.target.value);
            if (errors.tahunAjaran) setErrors((prev) => ({ ...prev, tahunAjaran: undefined }));
          }}
          type="text"
          placeholder="2023/2024"
          className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none ${
            errors.tahunAjaran
              ? "border-red-500/60 focus:border-red-500"
              : "border-border focus:border-primary/50"
          }`}
        />
        {errors.tahunAjaran && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} /> {errors.tahunAjaran}
          </p>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/kelas-siswa"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
          >
            BATAL
          </Link>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
          >
            SIMPAN →
          </button>
        </div>
      </form>

      <SuccessModal
        open={showSuccess}
        onClose={() => router.push("/kelas-siswa")}
        message="Kelas berhasil ditambahkan"
      />
    </div>
  );
}