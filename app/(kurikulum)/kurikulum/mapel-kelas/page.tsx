"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, ChevronRight, X } from "lucide-react";

type MapelItem = { nama: string; guru: string[] };
type KelasItem = { id: string; nama: string; waliKelas: string; mapel: MapelItem[] };

export default function MapelKelasPage() {
  const [data, setData] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cari, setCari] = useState<string>("");
  const [dipilih, setDipilih] = useState<KelasItem | null>(null);

  useEffect(() => {
    fetch("/api/kurikulum/mapel-kelas")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setData(d))
      .finally(() => setLoading(false));
  }, []);

  // Tutup popup dengan tombol Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDipilih(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tampil = data.filter((k) => k.nama.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Mapel & Kelas</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Pilih kelas untuk melihat mata pelajaran dan guru pengajarnya.
      </p>

      <div className="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Search size={16} className="text-muted" />
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari kelas..."
          className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat data...
        </div>
      ) : tampil.length === 0 ? (
        <p className="mt-8 text-muted">Kelas tidak ditemukan.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tampil.map((k, idx) => (
            <button
              key={k.id}
              onClick={() => setDipilih(k)}
              className="animate-fade-in-up group flex items-center justify-between rounded-2xl border border-border bg-surface p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/5"
              style={{ animationDelay: idx * 40 + "ms" }}
            >
              <div>
                <h3 className="text-xl font-bold text-white">{k.nama}</h3>
                <p className="mt-1 text-sm text-muted">Wali kelas: {k.waliKelas}</p>
                <span className="mt-3 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                  {k.mapel.length} mata pelajaran
                </span>
              </div>
              <ChevronRight
                size={22}
                className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
              />
            </button>
          ))}
        </div>
      )}

      {/* Popup daftar mapel */}
      {dipilih && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDipilih(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in-up flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{dipilih.nama}</h2>
                <p className="mt-1 text-sm text-muted">Wali kelas: {dipilih.waliKelas}</p>
              </div>
              <button
                onClick={() => setDipilih(null)}
                aria-label="Tutup"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted">
                MATA PELAJARAN ({dipilih.mapel.length})
              </p>
              {dipilih.mapel.length === 0 ? (
                <p className="text-sm text-muted">Belum ada mapel di kelas ini.</p>
              ) : (
                <ul className="space-y-2">
                  {dipilih.mapel.map((m) => (
                    <li key={m.nama} className="rounded-xl bg-black/30 px-4 py-3">
                      <p className="text-sm font-medium text-gray-200">{m.nama}</p>
                      <p className="text-xs text-muted">
                        {m.guru.length > 0 ? m.guru.join(", ") : "Belum ada guru"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}