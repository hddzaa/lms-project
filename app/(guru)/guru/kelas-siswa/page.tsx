"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { initials } from "@/lib/dummy-data";

type Kelas = {
  id: string;
  grade: string;
  name: string;
  category: string;
  waliKelas: string;
  jumlahSiswa: number;
  kapasitas: number;
  tahunAjaran: string;
  akses: "wali" | "pengajar";
};

export default function GuruKelasSiswaPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKelas() {
      const res = await fetch("/api/guru/kelas");
      if (res.ok) setKelas(await res.json());
      setLoading(false);
    }
    fetchKelas();
  }, []);

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Kelas & Siswa</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Lihat kelas yang Anda wali-i dan kelas tempat Anda mengajar.
      </p>

      <div className="animate-fade-in-up mt-6 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "120ms" }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 size={18} className="animate-spin" /> Memuat data kelas...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Nama Kelas</th>
                <th className="px-6 py-4 font-medium">Wali Kelas</th>
                <th className="px-6 py-4 font-medium">Jumlah Siswa</th>
                <th className="px-6 py-4 font-medium">Peran Anda</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kelas.map((k) => {
                const isWali = k.akses === "wali";
                return (
                  <tr key={k.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-sm font-semibold text-primary">
                          {k.grade}
                        </span>
                        <div>
                          <p className="font-medium text-white">{k.name}</p>
                          <p className="text-xs text-muted">{k.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-bg">
                          {initials(k.waliKelas)}
                        </span>
                        <span className="text-gray-300">{k.waliKelas}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                        {k.jumlahSiswa} Siswa
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${isWali ? "bg-primary-soft text-primary" : "bg-white/10 text-gray-300"}`}>
                        {isWali ? "Wali Kelas" : "Pengajar"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Link href={`/guru/kelas-siswa/${k.id}/siswa`} title="Lihat Siswa" className="text-gray-400 transition-transform hover:scale-110 hover:text-gray-200">
                          <Eye size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {kelas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    Anda belum menjadi wali kelas atau pengajar di kelas manapun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}