"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Plus,
  Users,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { kelasList as initialKelasList, initials, deleteKelas, type Kelas } from "@/lib/dummy-data";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";

const gradeStyle: Record<Kelas["grade"], string> = {
  X: "bg-primary-soft text-primary",
  XI: "bg-secondary-soft text-secondary",
  XII: "bg-white/10 text-gray-300",
};

export default function KelasSiswaPage() {
  const [kelas, setKelas] = useState(initialKelasList);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Kelas | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const filtered = kelas.filter((k) =>
    `${k.grade} ${k.name}`.toLowerCase().includes(search.toLowerCase())
  );

  function handleConfirmDelete() {
  if (!deleteTarget) return;
  deleteKelas(deleteTarget.id);
  setKelas((prev) => prev.filter((k) => k.id !== deleteTarget.id));
  setDeleteTarget(null);
  setToastOpen(true);
}

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-semibold text-white">
            Manajemen Kelas & Siswa
          </h1>
          <p className="mt-1 max-w-2xl text-muted">
            Kelola seluruh entitas ruang lingkup akademik, struktur kelas, dan
            pendelegasian wali kelas untuk tahun ajaran aktif.
          </p>
        </div>
        <Link
          href="/kelas-siswa/tambah"
          className="animate-fade-in-up flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
          style={{ animationDelay: "80ms" }}
        >
          <Plus size={16} /> Tambah Kelas
        </Link>
      </div>

      {/* Toolbar */}
      <div
        className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-between gap-3"
        style={{ animationDelay: "120ms" }}
      >
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Cari kelas..."
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
            <Filter size={15} /> Filter
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface"
        style={{ animationDelay: "160ms" }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">No</th>
              <th className="px-6 py-4 font-medium">Nama Kelas</th>
              <th className="px-6 py-4 font-medium">Wali Kelas</th>
              <th className="px-6 py-4 font-medium">Jumlah Siswa</th>
              <th className="px-6 py-4 font-medium">Tahun Ajaran</th>
              <th className="px-6 py-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k, i) => (
              <tr
                key={k.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4 text-muted">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${gradeStyle[k.grade]}`}
                    >
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
                <td className="px-6 py-4 text-gray-300">{k.tahunAjaran}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/kelas-siswa/${k.id}/siswa`}
                      title="Kelola Siswa"
                      className="text-primary transition-transform hover:scale-110"
                    >
                      <Users size={17} />
                    </Link>
                    <Link
                      href={`/kelas-siswa/${k.id}/edit`}
                      title="Edit Kelas"
                      className="text-gray-400 transition-transform hover:scale-110 hover:text-gray-200"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      title="Hapus Kelas"
                      onClick={() => setDeleteTarget(k)}
                      className="text-red-400 transition-transform hover:scale-110 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted">
                  Tidak ada kelas ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>Menampilkan 1-{filtered.length} dari {kelas.length} total kelas</p>
        <div className="flex items-center gap-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronLeft size={15} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-bg">
            1
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            2
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            3
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemLabel={deleteTarget ? `kelas ${deleteTarget.grade} ${deleteTarget.name}` : "data ini"}
      />

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Kelas berhasil dihapus"
      />
    </div>
  );
}