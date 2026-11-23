"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

type MapelItem = { nama: string; guru: string[] };
type KelasItem = { id: string; nama: string; waliKelas: string; mapel: MapelItem[] };

export default function MapelKelasPage() {
  const [data, setData] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cari, setCari] = useState<string>("");

  useEffect(() => {
    fetch("/api/kurikulum/mapel-kelas")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setData(d))
      .finally(() => setLoading(false));
  }, []);

  const tampil = data.filter((k) => k.nama.toLowerCase().includes(cari.toLowerCase()));

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Mapel & Kelas</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Daftar mata pelajaran di setiap kelas beserta guru pengajarnya.
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
            <div
              key={k.id}
              className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6"
              style={{ animationDelay: idx * 40 + "ms" }}
            >
              <h3 className="text-xl font-bold text-white">{k.nama}</h3>
              <p className="mt-1 text-sm text-muted">Wali kelas: {k.waliKelas}</p>

              <p className="mb-2 mt-5 text-xs font-medium tracking-wide text-muted">
                MATA PELAJARAN ({k.mapel.length})
              </p>
              {k.mapel.length === 0 ? (
                <p className="text-sm text-muted">Belum ada mapel.</p>
              ) : (
                <ul className="space-y-2">
                  {k.mapel.map((m) => (
                    <li key={m.nama} className="rounded-xl bg-black/30 px-3 py-2">
                      <p className="text-sm font-medium text-gray-200">{m.nama}</p>
                      <p className="text-xs text-muted">{m.guru.length > 0 ? m.guru.join(", ") : "Belum ada guru"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}