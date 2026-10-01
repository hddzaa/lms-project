"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, HelpCircle, ClipboardCheck, BarChart3 } from "lucide-react";

type Assessment = {
  id: string;
  judul: string;
  mapel: string;
  guruNama: string;
  jenis: string;
  deadline: string;
  durasiMenit: number;
  jumlahSoal: number;
  statusKerja: string;
  nilai: number | null;
};

const jenisIcon: Record<string, any> = { Kuis: HelpCircle, Ujian: ClipboardCheck, Penilaian: BarChart3 };
const jenisBadge: Record<string, string> = {
  Kuis: "bg-primary-soft text-primary",
  Ujian: "bg-secondary-soft text-secondary",
  Penilaian: "bg-white/10 text-gray-300",
};

export default function SiswaAssessmentPage() {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Semua");

  useEffect(() => {
    fetch("/api/siswa/assessment").then((r) => r.json()).then((d) => setData(d)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === "Semua" ? data : data.filter((a) => a.jenis === tab);

  return (
    <div>
      <h1 className="animate-fade-in-up text-2xl font-semibold text-white">Assessmen</h1>
      <p className="animate-fade-in-up mt-1 text-muted" style={{ animationDelay: "60ms" }}>
        Kerjakan assessment sesuai jadwal yang telah ditentukan untuk mengukur kemajuan belajar Anda.
      </p>

      <div className="animate-fade-in-up mt-6 inline-flex gap-1 rounded-2xl border border-border bg-surface p-1.5" style={{ animationDelay: "100ms" }}>
        {["Semua", "Kuis", "Ujian", "Penilaian"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-primary text-bg" : "text-gray-400 hover:text-gray-200"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
          <Loader2 size={18} className="animate-spin" /> Memuat assessment...
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => {
            const Icon = jenisIcon[a.jenis] || HelpCircle;
            const isSelesai = a.statusKerja === "Selesai" || a.statusKerja === "Perlu Dinilai";
            return (
              <div key={a.id} className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon size={18} /></span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${jenisBadge[a.jenis]}`}>{a.jenis}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{a.judul}</h3>
                <p className="mt-1 text-xs text-muted">{a.mapel} | {a.guruNama}</p>

                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Tenggat</span><span className="text-gray-200">{a.deadline ? new Date(a.deadline).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Durasi</span><span className="text-gray-200">{a.durasiMenit} Menit</span></div>
                </div>

                {isSelesai ? (
                  <>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {a.statusKerja === "Perlu Dinilai" ? "Menunggu penilaian guru" : "Selesai"}</p>
                    {a.nilai !== null && <p className="mt-1 text-sm">Nilai Akhir <span className="font-bold text-secondary">{a.nilai}/100</span></p>}
                    <Link href={`/siswa/assessment/${a.id}/kerjakan`} className="mt-4 block rounded-xl border border-border py-2.5 text-center text-sm font-medium text-gray-300 hover:bg-white/5">
                      Lihat Review
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-xs text-muted">
                      {a.statusKerja === "Sedang Berlangsung" ? "• Sedang berlangsung" : "• Belum dikerjakan"}
                    </p>
                    <Link href={`/siswa/assessment/${a.id}/kerjakan`} className="mt-4 block rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-bg transition-transform hover:scale-105">
                      {a.statusKerja === "Sedang Berlangsung" ? "Lanjutkan" : "Mulai Assessment"}
                    </Link>
                  </>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted">Tidak ada assessment untuk kategori ini.</div>
          )}
        </div>
      )}
    </div>
  );
}