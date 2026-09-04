"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, IdCard, Mail, Users2 } from "lucide-react";
import { getKelasById, addSiswa } from "@/lib/dummy-data";
import SuccessModal from "@/components/ui/SuccessModal";

export default function TambahSiswaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kelas = getKelasById(params.id);

  const [nama, setNama] = useState("");
  const [nis, setNis] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (!nama || !nis || !gender) return;
    addSiswa(kelas!.id, {
      nama,
      nis,
      email: email || `${nama.split(" ")[0].toLowerCase()}@aetheris.edu`,
      gender: gender as "Laki-laki" | "Perempuan",
    });
    setShowSuccess(true);
  }

  return (
    <div>
      <p className="animate-fade-in-up text-sm text-muted">
        <Link href="/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>
        {" › "}
        <Link href="/kelas-siswa" className="hover:text-gray-300">
          Kelas & Siswa
        </Link>
        {" › "}
        <span className="text-primary">Tambah Siswa</span>
      </p>
      <h1
        className="animate-fade-in-up mt-2 text-3xl font-bold text-primary"
        style={{ animationDelay: "40ms" }}
      >
        Tambah Siswa
      </h1>
      <p
        className="animate-fade-in-up mt-2 max-w-2xl text-muted"
        style={{ animationDelay: "80ms" }}
      >
        Tambahkan siswa ke kelas yang sedang dipilih. Pastikan semua data
        akademik telah divalidasi sebelum disimpan.
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in-up flex-1 rounded-2xl border border-border bg-surface p-8"
          style={{ animationDelay: "120ms" }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <User size={14} /> Nama Lengkap
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                type="text"
                placeholder="Contoh: Muhammad Aris"
                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <IdCard size={14} /> Nomor Induk Siswa (NIS)
              </label>
              <input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                type="text"
                placeholder="Contoh: 202300192"
                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Mail size={14} /> Email Akademik
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="nama@aetheris.edu"
                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
                <Users2 size={14} /> Jenis Kelamin
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                >
                  <option value="" disabled>
                    Pilih Jenis Kelamin
                  </option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
            <Link
              href={`/kelas-siswa/${kelas.id}/siswa`}
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

        {/* Kelas terpilih */}
        <div
          className="animate-fade-in-up h-fit w-full rounded-2xl border border-border bg-surface p-6 lg:w-72"
          style={{ animationDelay: "160ms" }}
        >
          <p className="text-sm font-medium text-primary">Kelas Terpilih</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
              {kelas.grade}
            </span>
            <div>
              <p className="font-semibold text-white">
                {kelas.grade}-{kelas.name}
              </p>
              <p className="text-xs text-muted">{kelas.category}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <p className="text-xs text-muted">KAPASITAS</p>
              <p className="mt-1 font-semibold text-white">
                {kelas.jumlahSiswa} / {kelas.kapasitas}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">TAHUN AJARAN</p>
              <p className="mt-1 font-semibold text-white">{kelas.tahunAjaran}</p>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => router.push(`/kelas-siswa/${kelas.id}/siswa`)}
        message="Siswa berhasil ditambahkan"
      />
    </div>
  );
}