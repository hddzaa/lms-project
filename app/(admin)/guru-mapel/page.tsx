"use client";

import { useState } from "react";
import { Search, Filter, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, User, FileText } from "lucide-react";
import {
  guruList as initialGuruList,
  mapelList as initialMapelList,
  addGuru,
  updateGuru,
  deleteGuru,
  addMapel,
  updateMapel,
  deleteMapel,
  getMapelNames,
  getGuruNames,
  getBadgeColor,
  getAvatarColor,
  initials,
  type Guru,
  type MataPelajaran,
} from "@/lib/dummy-data";
import Link from "next/link";
import MapelModal from "@/components/guru-mapel(admin)/MapelModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import Toast from "@/components/ui/Toast";

type DeleteTarget = { kind: "guru"; data: Guru } | { kind: "mapel"; data: MataPelajaran } | null;

export default function GuruMapelPage() {
  const [tab, setTab] = useState<"guru" | "mapel">("guru");
  const [guru, setGuru] = useState(initialGuruList);
  const [mapel, setMapel] = useState(initialMapelList);
  const [search, setSearch] = useState("");


  const [showMapelModal, setShowMapelModal] = useState(false);
  const [editMapel, setEditMapel] = useState<MataPelajaran | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const filteredGuru = guru.filter(
    (g) => g.nama.toLowerCase().includes(search.toLowerCase()) || g.nip.includes(search)
  );
  const filteredMapel = mapel.filter((m) => m.nama.toLowerCase().includes(search.toLowerCase()));

  function showToast(message: string) {
    setToast({ open: true, message });
  }


  function handleMapelSubmit(data: Omit<MataPelajaran, "id">) {
    if (editMapel) {
      updateMapel(editMapel.id, data);
      setMapel((prev) => prev.map((m) => (m.id === editMapel.id ? { ...m, ...data } : m)));
      showToast("Perubahan berhasil disimpan");
    } else {
      const newMapel = addMapel(data);
      setMapel((prev) => [...prev, newMapel]);
      showToast("Mata pelajaran berhasil ditambahkan");
    }
    setShowMapelModal(false);
    setEditMapel(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "guru") {
      deleteGuru(deleteTarget.data.id);
      setGuru((prev) => prev.filter((g) => g.id !== deleteTarget.data.id));
      showToast("Guru berhasil dihapus");
    } else {
      deleteMapel(deleteTarget.data.id);
      setMapel((prev) => prev.filter((m) => m.id !== deleteTarget.data.id));
      showToast("Mata pelajaran berhasil dihapus");
    }
    setDeleteTarget(null);
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">
        Management Guru & Mata Pelajaran
      </h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Kelola data tenaga pendidik dan kurikulum akademik.
      </p>

      {/* Tabs */}
      <div
        className="animate-fade-in-up mt-6 inline-flex gap-1 rounded-2xl border border-border bg-surface p-1.5"
        style={{ animationDelay: "100ms" }}
      >
        <button
          onClick={() => { setTab("guru"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-colors ${tab === "guru" ? "bg-primary-soft text-primary" : "text-gray-400 hover:text-gray-200"
            }`}
        >
          <User size={15} /> Guru
        </button>
        <button
          onClick={() => { setTab("mapel"); setSearch(""); }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-colors ${tab === "mapel" ? "bg-primary-soft text-primary" : "text-gray-400 hover:text-gray-200"
            }`}
        >
          <FileText size={15} /> Mata Pelajaran
        </button>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in-up mt-5 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "140ms" }}>
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder={tab === "guru" ? "Cari nama guru atau NIP..." : "Cari mata pelajaran..."}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5">
            <Filter size={15} /> Filter
          </button>
          {tab === "guru" ? (
            <Link
              href="/guru-mapel/tambah-guru"
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
            >
              <Plus size={16} /> Tambah Guru
            </Link>
          ) : (
            <button
              onClick={() => { setEditMapel(null); setShowMapelModal(true); }}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
            >
              <Plus size={16} /> Tambah Mapel
            </button>
          )}
        </div>
      </div>

      {/* Table Guru */}
      {tab === "guru" && (
        <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "180ms" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Nama Guru</th>
                <th className="px-6 py-4 font-medium">NIP</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Mata Pelajaran</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuru.map((g, i) => (
                <tr key={g.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-muted">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${getAvatarColor(i)}`}>
                        {initials(g.nama)}
                      </span>
                      <span className="font-medium text-white">{g.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{g.nip}</td>
                  <td className="px-6 py-4 text-gray-300">{g.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getBadgeColor(i)}`}>{g.mapel}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/guru-mapel/${g.id}/edit`} className="text-gray-400 transition-transform hover:scale-110 hover:text-gray-200">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => setDeleteTarget({ kind: "guru", data: g })} className="text-red-400 transition-transform hover:scale-110 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGuru.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted">Tidak ada guru ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Mapel */}
      {tab === "mapel" && (
        <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "180ms" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Nama Mata Pelajaran</th>
                <th className="px-6 py-4 font-medium">Guru Pengampu</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMapel.map((m, i) => (
                <tr key={m.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-muted">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${getBadgeColor(i)}`}>
                        {m.nama[0]}
                      </span>
                      <span className="font-medium text-white">{m.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{m.guruPengampu}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setEditMapel(m); setShowMapelModal(true); }} className="text-gray-400 transition-transform hover:scale-110 hover:text-gray-200">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget({ kind: "mapel", data: m })} className="text-red-400 transition-transform hover:scale-110 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMapel.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-muted">Tidak ada mata pelajaran ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>Menampilkan {tab === "guru" ? filteredGuru.length : filteredMapel.length} dari {tab === "guru" ? guru.length : mapel.length} data</p>
        <div className="flex items-center gap-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronLeft size={15} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-bg">1</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>


      <MapelModal
        open={showMapelModal}
        onClose={() => { setShowMapelModal(false); setEditMapel(null); }}
        onSubmit={handleMapelSubmit}
        initialData={editMapel}
        guruOptions={getGuruNames()}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemLabel={
          deleteTarget?.kind === "guru"
            ? `guru ${deleteTarget.data.nama}`
            : deleteTarget?.kind === "mapel"
              ? `mata pelajaran ${deleteTarget.data.nama}`
              : "data ini"
        }
      />

      <Toast open={toast.open} onClose={() => setToast({ open: false, message: "" })} message={toast.message} />
    </div>
  );
}