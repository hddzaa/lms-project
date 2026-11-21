"use client";

import { useEffect, useState } from "react";
import { Loader2, GraduationCap } from "lucide-react";

type Item = {
  id: string;
  sumber: "Assessment" | "Tugas";
  judul: string;
  jenis: string;
  nilai: number | null;
  keterangan: string;
};
type NilaiMapel = { mapel: string; items: Item[]; nilaiAkhir: number | null };

const sumberBadge: Record<string, string> = {
  Assessment: "bg-secondary-soft text-secondary",
  Tugas: "bg-primary-soft text-primary",
};

function warnaNilai(n: number | null) {
  if (n === null) return "text-muted";
  if (n >= 80) return "text-emerald-400";
  if (n >= 60) return "text-primary";
  return "text-red-400";
}

export default function SiswaNilaiPage() {
  const [data, setData] = useState<NilaiMapel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/siswa/nilai")
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const akhirList = data.map((m) => m.nilaiAkhir).filter((n): n is number => n !== null);
  const rataKeseluruhan = akhirList.length
    ? Math.round((akhirList.reduce((a, b) => a + b, 0) / akhirList.length) * 10) / 10
    : null;

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Nilai</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Rincian nilai assessment dan tugas per mata pelajaran, beserta nilai akhirnya.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat nilai...
        </div>
      ) : data.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-muted">
          <GraduationCap size={28} />
          Belum ada assessment atau tugas untuk kelas Anda.
        </div>
      ) : (
        <>
          <div className="animate-fade-in-up mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface px-8 py-6" style={{ animationDelay: "100ms" }}>
            <div>
              <p className="text-xs tracking-wide text-muted">RATA-RATA NILAI AKHIR</p>
              <p className="mt-1 text-xs text-muted">Dari {akhirList.length} mata pelajaran yang sudah bernilai</p>
            </div>
            <p className={`text-4xl font-bold ${warnaNilai(rataKeseluruhan)}`}>{rataKeseluruhan ?? "-"}</p>
          </div>

          <div className="mt-6 space-y-6">
            {data.map((m, i) => (
              <div key={m.mapel} className="animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-surface" style={{ animationDelay: `${140 + i * 50}ms` }}>
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">{m.mapel}</h2>
                  <div className="text-right">
                    <p className="text-xs tracking-wide text-muted">NILAI AKHIR</p>
                    <p className={`text-2xl font-bold ${warnaNilai(m.nilaiAkhir)}`}>{m.nilaiAkhir ?? "-"}</p>
                  </div>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="px-6 py-3 font-medium">Jenis</th>
                      <th className="px-6 py-3 font-medium">Judul</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.items.map((it) => (
                      <tr key={`${it.sumber}-${it.id}`} className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${sumberBadge[it.sumber]}`}>
                            {it.sumber} · {it.jenis}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-white">{it.judul}</td>
                        <td className="px-6 py-3 text-gray-300">{it.keterangan}</td>
                        <td className={`px-6 py-3 text-right font-semibold ${warnaNilai(it.nilai)}`}>{it.nilai ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}