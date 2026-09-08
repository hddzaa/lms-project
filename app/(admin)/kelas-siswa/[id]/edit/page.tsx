"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { waliKelasOptions, getKelasById, updateKelas } from "@/lib/dummy-data";
import Toast from "@/components/ui/Toast";

export default function EditKelasPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kelas = getKelasById(params.id);

  const [nama, setNama] = useState(kelas ? `${kelas.grade} ${kelas.name}` : "");
  const [wali, setWali] = useState(kelas?.waliKelas ?? "");
  const [tahunAjaran, setTahunAjaran] = useState(kelas?.tahunAjaran ?? "");
  const [showToast, setShowToast] = useState(false);

  if (!kelas) {
    return (
      <div className="text-muted">
        Kelas tidak ditemukan.{" "}
        <Link href="/kelas-siswa" className="text-primary hover:underline">
          Kembali ke daftar kelas
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parts = nama.trim().split(" ");
    const grade = parts[0].toUpperCase();
    const rest = parts.slice(1).join(" ") || nama;
    updateKelas(kelas!.id, {
      grade: (["X", "XI", "XII"].includes(grade) ? grade : kelas!.grade) as "X" | "XI" | "XII",
      name: rest,
      waliKelas: wali,
      tahunAjaran,
    });
    setShowToast(true);
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Edit Kelas</h1>
      <p
        className="animate-fade-in-up mt-2 text-muted"
        style={{ animationDelay: "40ms" }}
      >
        Perbarui informasi kelas secara presisi melalui sistem administrasi
        pusat Aetheris.
      </p>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up mt-6 max-w-2xl rounded-2xl border border-border bg-surface p-8"
        style={{ animationDelay: "80ms" }}
      >
        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">
          NAMA KELAS
        </label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          type="text"
          className="mb-6 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">
          WALI KELAS
        </label>
        <div className="relative mb-6">
          <select
            value={wali}
            onChange={(e) => setWali(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
          >
            {waliKelasOptions.map((g) => (
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

        <label className="mb-2 block text-xs font-medium tracking-wide text-muted">
          TAHUN AJARAN
        </label>
        <input
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
          type="text"
          className="mb-8 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
        />

        <div className="flex justify-end gap-3 border-t border-border pt-6">
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

      <Toast
        open={showToast}
        onClose={() => {
          setShowToast(false);
          router.push("/kelas-siswa");
        }}
        message="Perubahan berhasil disimpan"
      />
    </div>
  );
}