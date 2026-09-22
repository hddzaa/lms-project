"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Pencil, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { initials } from "@/lib/dummy-data";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";

type Siswa = { id: string; nama: string; nis: string; email: string; gender: "Laki-laki" | "Perempuan" };
type KelasInfo = { id: string; grade: string; name: string; waliKelas: string; kapasitas: number };

const genderStyle: Record<string, string> = {
  "Laki-laki": "bg-primary-soft text-primary",
  Perempuan: "bg-secondary-soft text-secondary",
};

export default function KelolaSiswaPage() {
  const params = useParams<{ id: string }>();
  const [kelas, setKelas] = useState<KelasInfo | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [kelasRes, siswaRes] = await Promise.all([
      fetch(`/api/kelas/${params.id}`),
      fetch(`/api/kelas/${params.id}/siswa`),
    ]);
    if (kelasRes.ok) setKelas(await kelasRes.json());
    if (siswaRes.ok) setSiswaList(await siswaRes.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const filtered = siswaList.filter((s) => s.nama.toLowerCase().includes(search.toLowerCase()));

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/kelas/${params.id}/siswa/${deleteTarget.id}`, { method: "DELETE" });
    setSiswaList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToastOpen(true);
  }

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
        <Link href="/kelas-siswa" className="text-primary hover:underline">Kembali ke daftar kelas</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Kelola Siswa</h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "40ms" }}>
        Kelola seluruh siswa pada kelas yang dipilih secara efisien dengan sistem manajemen terpusat Aetheris.
      </p>

      <div className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface px-8 py-6" style={{ animationDelay: "80ms" }}>
        <div className="flex flex-wrap gap-10">
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
        <Link href={`/kelas-siswa/${kelas.id}/edit`} className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
          <Pencil size={15} /> Edit Kelas
        </Link>
      </div>

      <div className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "120ms" }}>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari nama siswa..."
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
            <Filter size={15} /> Filter
          </button>
          <Link href={`/kelas-siswa/${kelas.id}/siswa/tambah`} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105">
            <Plus size={16} /> Tambah Siswa
          </Link>
        </div>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "160ms" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">No</th>
              <th className="px-6 py-4 font-medium">Nama Lengkap</th>
              <th className="px-6 py-4 font-medium">NIS</th>
              <th className="px-6 py-4 font-medium">Email Academic</th>
              <th className="px-6 py-4 font-medium">Jenis Kelamin</th>
              <th className="px-6 py-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/kelas-siswa/${kelas.id}/siswa/${s.id}/edit`} title="Edit Siswa" className="text-gray-400 transition-transform hover:scale-110 hover:text-gray-200">
                      <Pencil size={16} />
                    </Link>
                    <button title="Hapus Siswa" onClick={() => setDeleteTarget(s)} className="text-red-400 transition-transform hover:scale-110 hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted">Belum ada siswa di kelas ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>Menampilkan {filtered.length} dari {siswaList.length} siswa</p>
        <Link href="/kelas-siswa" className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-gray-300 transition-colors hover:bg-white/5">
          <ChevronLeft size={15} /> Kembali
        </Link>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemLabel={deleteTarget ? `siswa ${deleteTarget.nama}` : "data ini"}
      />

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} message="Siswa berhasil dihapus" />
    </div>
  );
}