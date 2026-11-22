"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, Eye, Pencil, Trash2, ClipboardList, Loader2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

type Tugas = {
  _id: string;
  judul: string;
  jenis: string;
  mapel: string;
  kelasId?: { grade: string; name: string };
  deadline: string;
  jumlahKumpul: number;
  files?: { url: string }[];
};

const jenisBadge: Record<string, string> = {
  tugas: "bg-violet-400/10 text-violet-300",
  project: "bg-emerald-400/10 text-emerald-300",
};

export default function TugasProjectPage() {
  const [data, setData] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua Jenis");
  const [hapusId, setHapusId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/guru/tugas");
    const d = await res.json();
    setData(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function konfirmasiHapus() {
    if (!hapusId) return;
    await fetch(`/api/guru/tugas/${hapusId}`, { method: "DELETE" });
    setHapusId(null);
    load();
  }

  const filtered = data.filter((t) => {
    const cocokCari = t.judul.toLowerCase().includes(search.toLowerCase());
    const cocokJenis = jenisFilter === "Semua Jenis" || t.jenis === jenisFilter.toLowerCase();
    return cocokCari && cocokJenis;
  });

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Tugas & Project</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Kelola tugas dan project yang diberikan kepada siswa.
      </p>

      <div className="animate-fade-in-up mt-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari tugas..."
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
            />
          </div>
          <div className="relative">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 pr-9 text-sm text-gray-200 outline-none focus:border-primary/50"
            >
              <option>Semua Jenis</option>
              <option>Tugas</option>
              <option>Project</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <Link
          href="/guru/tugas-project/tambah"
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
        >
          <Plus size={16} /> Buat Tugas
        </Link>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "140ms" }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 size={18} className="animate-spin" /> Memuat tugas...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Judul</th>
                <th className="px-6 py-4 font-medium">Mata Pelajaran</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Jenis</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 font-medium">Terkumpul</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <ClipboardList size={16} />
                      </span>
                      <span className="font-medium text-white">{t.judul}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{t.mapel}</td>
                  <td className="px-6 py-4 text-gray-300">{t.kelasId ? `${t.kelasId.grade} ${t.kelasId.name}` : "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${jenisBadge[t.jenis] ?? ""}`}>{t.jenis}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(t.deadline).toLocaleString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{t.jumlahKumpul} siswa</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-gray-400">
                      <Link href={`/guru/tugas-project/${t._id}`} title="Detail & Penilaian" className="hover:text-gray-200"><Eye size={16} /></Link>
                      <Link href={`/guru/tugas-project/${t._id}/edit`} title="Edit" className="hover:text-gray-200"><Pencil size={16} /></Link>
                      <button onClick={() => setHapusId(t._id)} title="Hapus" className="hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted">
                    Belum ada tugas. Klik "Buat Tugas" untuk membuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        open={Boolean(hapusId)}
        onClose={() => setHapusId(null)}
        onConfirm={konfirmasiHapus}
        itemLabel="tugas ini"
      />
    </div>
  );
}