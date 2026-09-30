"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

type Kelas = { id: string; grade: string; name: string };

const jenisOptions = [
  { value: "Kuis", label: "Kuis", desc: "Latihan singkat & interaktif" },
  { value: "Ujian", label: "Ujian", desc: "Penilaian formal terjadwal" },
  { value: "Penilaian", label: "Penilaian", desc: "Evaluasi proyek atau praktik" },
];

export default function TambahAssessmentPage() {
  const router = useRouter();
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [kelasOptions, setKelasOptions] = useState<Kelas[]>([]);
  const [judul, setJudul] = useState("");
  const [mapel, setMapel] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jenis, setJenis] = useState("Kuis");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [deadline, setDeadline] = useState("");
  const [durasi, setDurasi] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/mapel").then((r) => r.json()), fetch("/api/kelas").then((r) => r.json())]).then(
      ([mapelData, kelasData]) => {
        setMapelOptions(mapelData.map((m: any) => m.nama));
        setKelasOptions(kelasData.map((k: any) => ({ id: k.id, grade: k.grade, name: k.name })));
      }
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !mapel || !kelasId) return;

    setSubmitting(true);
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, mapel, kelasId, deskripsi, jenis, tanggalMulai, deadline, durasiMenit: durasi }),
    });
    const data = await res.json();
    setSubmitting(false);
    router.push(`/guru/assessment/${data.id}/soal`);
  }

  return (
    <div>
      <p className="animate-fade-in-up text-xs font-semibold tracking-wide text-primary">— NEW ASSESSMENT</p>
      <h1 className="animate-fade-in-up mt-1 text-3xl font-bold text-white" style={{ animationDelay: "40ms" }}>Buat Assessment</h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "80ms" }}>
        Lengkapi informasi dasar assessment sebelum membuat soal untuk menjaga struktur kurikulum yang tepat.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="animate-fade-in-up flex-1 rounded-2xl border border-border bg-surface p-8" style={{ animationDelay: "120ms" }}>
          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JUDUL ASSESSMENT</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            type="text"
            placeholder="Contoh: Ujian Tengah Semester Fisika Quantum"
            className="mb-6 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN</label>
              <div className="relative">
                <select value={mapel} onChange={(e) => setMapel(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50">
                  <option value="">Pilih Mata Pelajaran</option>
                  {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KELAS</label>
              <div className="relative">
                <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50">
                  <option value="">Pilih Kelas</option>
                  {kelasOptions.map((k) => (<option key={k.id} value={k.id}>{k.grade} {k.name}</option>))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DESKRIPSI ASSESSMENT</label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={5}
            placeholder="Berikan instruksi atau deskripsi singkat untuk siswa..."
            className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />
        </div>

        <div className="w-full space-y-4 lg:w-80">
          <div className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "160ms" }}>
            <p className="mb-4 text-xs font-medium tracking-wide text-muted">JENIS ASSESSMENT</p>
            <div className="space-y-2">
              {jenisOptions.map((j) => (
                <button
                  key={j.value}
                  type="button"
                  onClick={() => setJenis(j.value)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    jenis === j.value ? "border-primary/50 bg-primary-soft" : "border-border hover:bg-white/5"
                  }`}
                >
                  <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${jenis === j.value ? "border-primary bg-primary" : "border-gray-500"}`} />
                  <span>
                    <p className="text-sm font-semibold text-white">{j.label}</p>
                    <p className="text-xs text-muted">{j.desc}</p>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "200ms" }}>
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">TANGGAL MULAI</label>
            <input
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              type="datetime-local"
              className="mb-4 w-full rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
            />
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DEADLINE</label>
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="datetime-local"
              className="mb-4 w-full rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
            />
            <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DURASI (MENIT)</label>
            <input
              value={durasi}
              onChange={(e) => setDurasi(Number(e.target.value))}
              type="number"
              className="w-full rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={() => router.push("/guru/assessment")} className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
          BATAL
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "LANJUT →"}
        </button>
      </div>
    </div>
  );
}