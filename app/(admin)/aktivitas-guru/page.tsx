"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";

type Aktivitas = {
  id: string;
  guruId: string;
  namaGuru: string;
  idGuru: string;
  jenis: string;
  keterangan: string;
  createdAt: string;
};

const jenisBadgeMap: Record<string, string> = {
  "Upload Materi": "bg-cyan-400/10 text-cyan-300",
  "Membuat Assessment": "bg-violet-400/10 text-violet-300",
  "Menilai Tugas": "bg-indigo-400/10 text-indigo-300",
  "Mengedit Assessment": "bg-rose-400/10 text-rose-300",
};
const jenisDotMap: Record<string, string> = {
  "Upload Materi": "bg-cyan-300",
  "Membuat Assessment": "bg-violet-300",
  "Menilai Tugas": "bg-indigo-300",
  "Mengedit Assessment": "bg-rose-300",
};

const jenisOptions = ["Semua Aktivitas", "Upload Materi", "Membuat Assessment", "Menilai Tugas", "Mengedit Assessment"];

function formatTanggalWaktu(iso: string) {
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
  const waktu = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
  return { tanggal, waktu };
}

export default function AktivitasGuruPage() {
  const [data, setData] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua Aktivitas");
  const [selected, setSelected] = useState<Aktivitas | null>(null);

  useEffect(() => {
    fetch("/api/aktivitas-guru")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((a) => {
    const matchSearch = a.namaGuru.toLowerCase().includes(search.toLowerCase());
    const matchJenis = jenisFilter === "Semua Aktivitas" || a.jenis === jenisFilter;
    return matchSearch && matchJenis;
  });

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Aktivitas Guru</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Pantau aktivitas guru yang dilakukan dalam sistem LMS.
      </p>

      <div className="animate-fade-in-up mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3" style={{ animationDelay: "100ms" }}>
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">PENCARIAN</label>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Cari nama guru..."
              className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">JENIS AKTIVITAS</label>
          <div className="relative">
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
            >
              {jenisOptions.map((j) => (<option key={j} value={j}>{j}</option>))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted">TANGGAL</label>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="date" className="w-full rounded-xl border border-border bg-black/30 py-2.5 pl-10 pr-3 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]" />
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up mt-5 overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: "140ms" }}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 size={18} className="animate-spin" /> Memuat data...
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-4 font-medium">Waktu</th>
                <th className="px-6 py-4 font-medium">ID Guru</th>
                <th className="px-6 py-4 font-medium">Nama Guru</th>
                <th className="px-6 py-4 font-medium">Aktivitas</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
                <th className="px-6 py-4 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const { tanggal, waktu } = formatTanggalWaktu(a.createdAt);
                return (
                  <tr key={a.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="text-white">{tanggal}</p>
                      <p className="text-xs text-muted">{waktu}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{a.idGuru}</td>
                    <td className="px-6 py-4 font-medium text-white">{a.namaGuru}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${jenisBadgeMap[a.jenis]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${jenisDotMap[a.jenis]}`} />
                        {a.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{a.keterangan}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelected(a)} className="text-sm font-medium text-primary hover:underline">
                        Lihat Aktivitas
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted">
                    Belum ada data aktivitas guru. Data akan muncul otomatis setelah role Guru aktif digunakan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted">
        <p>Menampilkan {filtered.length} dari {data.length} aktivitas</p>
        <div className="flex items-center gap-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5"><ChevronLeft size={15} /></button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-bg">1</button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-400 hover:bg-white/5"><ChevronRight size={15} /></button>
        </div>
      </div>

      {selected && (
        <DetailModal aktivitas={selected} allData={data} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function DetailModal({ aktivitas, allData, onClose }: { aktivitas: Aktivitas; allData: Aktivitas[]; onClose: () => void }) {
  const riwayat = allData.filter((a) => a.guruId === aktivitas.guruId).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-[#1a1c22] p-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-heading">Detail Aktivitas Guru</h3>

        <p className="mb-3 mt-6 text-xs font-semibold tracking-wide text-primary">RINGKASAN GURU</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/30 px-4 py-3">
            <p className="text-xs text-muted">Nama Guru</p>
            <p className="mt-1 font-semibold text-white">{aktivitas.namaGuru}</p>
          </div>
          <div className="rounded-xl bg-black/30 px-4 py-3">
            <p className="text-xs text-muted">ID Guru</p>
            <p className="mt-1 font-semibold text-white">{aktivitas.idGuru}</p>
          </div>
        </div>

        <p className="mb-3 mt-6 text-xs font-semibold tracking-wide text-primary">RIWAYAT AKTIVITAS TERAKHIR</p>
        <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
          {riwayat.map((r) => {
            const { tanggal, waktu } = formatTanggalWaktu(r.createdAt);
            return (
              <div key={r.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-500" />
                <div>
                  <p className="text-sm font-medium text-white">{r.jenis} - {r.keterangan}</p>
                  <p className="mt-0.5 text-xs text-muted">{tanggal}, {waktu}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <button onClick={onClose} className="rounded-full border border-border px-6 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}