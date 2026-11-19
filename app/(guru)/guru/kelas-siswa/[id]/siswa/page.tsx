"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { initials } from "@/lib/dummy-data";

type Siswa = { id: string; nama: string; nis: string; email: string; gender: string };
type KelasInfo = { id: string; grade: string; name: string; waliKelas: string; kapasitas: number };

const genderStyle: Record<string, string> = {
  "Laki-laki": "bg-primary-soft text-primary",
  Perempuan: "bg-secondary-soft text-secondary",
};

export default function GuruLihatSiswaPage() {
  const params = useParams<{ id: string }>();
  const [kelas, setKelas] = useState<KelasInfo | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [kelasRes, siswaRes] = await Promise.all([
        fetch(`/api/kelas/${params.id}`),
        fetch(`/api/kelas/${params.id}/siswa`),
      ]);
      if (kelasRes.ok) setKelas(await kelasRes.json());
      if (siswaRes.ok) setSiswaList(await siswaRes.json());
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data siswa...
      </div>
    );
  }

  if (!kelas) {
    return (
      <div className="text-muted">
        Kelas tidak ditemukan.{" "}
        <Link href="/guru/kelas-siswa" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/guru/kelas-siswa" className="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5">
        <ChevronLeft size={15} /> Kembali
      </Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Lihat Siswa</h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "40ms" }}>
        Daftar siswa pada kelas ini. Halaman ini hanya untuk melihat data.
      </p>

      <div className="animate-fade-in-up mt-6 flex flex-wrap gap-10 rounded-2xl border border-border bg-surface px-8 py-6" style={{ animationDelay: "80ms" }}>
        <div>
          <p className="text-xs tracking-wide text-muted">NAMA KELAS</p>
          <p className="mt-1 font-semibold text-primary">{kelas.grade} - {kelas.name}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted">WALI KELAS</p>
          <p className="mt-1 font-semibold text-white">{kelas.waliKelas}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted">JUMLAH SISWA</p>
          <p className="mt-1">
            <span className="font-semibold text-white">{siswaList.length}</span>
            <span className="text-muted"> / {kelas.kapasitas} Kapasitas</span>
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "120ms" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">No</th>
              <th className="px-6 py-4 font-medium">Nama Lengkap</th>
              <th className="px-6 py-4 font-medium">NIS</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Jenis Kelamin</th>
            </tr>
          </thead>
          <tbody>
            {siswaList.map((s, i) => (
              <tr key={s.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-muted">{String(i + 1).padStart(2, "0")}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-bg">
                      {initials(s.nama)}
                    </span>
                    <span className="font-medium text-white">{s.nama}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-primary">{s.nis}</td>
                <td className="px-6 py-4 text-gray-300">{s.email}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${genderStyle[s.gender]}`}>
                    {s.gender.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {siswaList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-muted">Belum ada siswa di kelas ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}