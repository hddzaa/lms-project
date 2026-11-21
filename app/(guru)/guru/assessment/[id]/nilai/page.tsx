"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Soal = { id: string; tipe: string; pertanyaan: string; opsi: { label: string; teks: string }[]; kunciJawaban: string; bobot: number };
type Sub = {
  id: string; siswaNama: string; siswaNis: string; status: string; nilai: number | null;
  jawaban: Record<string, string>; skor: Record<string, number>;
};

export default function NilaiAssessmentPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [judul, setJudul] = useState("");
  const [soal, setSoal] = useState<Soal[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [aktif, setAktif] = useState<string>("");
  const [skor, setSkor] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  async function load(pilih?: string) {
    const res = await fetch(`/api/guru/assessment/${params.id}/nilai`);
    if (!res.ok) { setError("Tidak bisa memuat data."); setLoading(false); return; }
    const d = await res.json();
    setJudul(d.assessment.judul);
    setSoal(d.assessment.soal);
    setSubs(d.submissions);
    const pilihan = pilih || aktif || d.submissions[0]?.id || "";
    setAktif(pilihan);
    const s = d.submissions.find((x: Sub) => x.id === pilihan);
    setSkor(s ? s.skor : {});
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [params.id]);

  function pilihSiswa(id: string) {
    setAktif(id);
    setSkor(subs.find((s) => s.id === id)?.skor ?? {});
    setError("");
  }

  async function simpan() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/guru/assessment/${params.id}/nilai`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: aktif, skor }),
    });
    setSaving(false);
    if (!res.ok) { setError("Gagal menyimpan nilai."); return; }
    setToast(true);
    load(aktif);
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-muted"><Loader2 size={18} className="animate-spin" /> Memuat...</div>;
  }

  const sub = subs.find((s) => s.id === aktif);
  const totalBobot = soal.reduce((a, s) => a + s.bobot, 0);
  const totalSkor = soal.reduce((a, s) => a + (Number(skor[s.id]) || 0), 0);
  const prediksi = totalBobot ? Math.round((totalSkor / totalBobot) * 100) : 0;

  return (
    <div>
      <Link href="/guru/assessment" className="animate-fade-in-up mb-4 inline-block text-sm text-muted hover:text-white">← Kembali</Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">Penilaian: {judul}</h1>
      <p className="animate-fade-in-up mt-2 text-muted" style={{ animationDelay: "40ms" }}>
        Nilai soal essay dan koreksi isian singkat jika perlu.
      </p>

      {subs.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-10 text-center text-muted">Belum ada siswa yang mengumpulkan.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="animate-fade-in-up w-full shrink-0 space-y-2 lg:w-72">
            {subs.map((s) => (
              <button
                key={s.id}
                onClick={() => pilihSiswa(s.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  aktif === s.id ? "border-primary/50 bg-primary-soft" : "border-border bg-surface hover:bg-white/5"
                }`}
              >
                <p className="text-sm font-semibold text-white">{s.siswaNama}</p>
                <p className="text-xs text-muted">
                  {s.siswaNis && `${s.siswaNis} • `}
                  <span className={s.status === "Selesai" ? "text-emerald-400" : "text-amber-400"}>
                    {s.status === "Selesai" ? `Selesai (${s.nilai})` : "Perlu dinilai"}
                  </span>
                </p>
              </button>
            ))}
          </div>

          {sub && (
            <div className="animate-fade-in-up flex-1 space-y-4">
              {soal.map((so, i) => {
                const jwb = sub.jawaban[so.id] || "";
                return (
                  <div key={so.id} className="rounded-2xl border border-border bg-surface p-6">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 capitalize text-gray-300">
                        {i + 1}. {so.tipe.replace("_", " ")}
                      </span>
                      <span className="text-muted">Bobot {so.bobot}</span>
                    </div>
                    <p className="font-medium text-white">{so.pertanyaan}</p>

                    <p className="mt-3 text-xs tracking-wide text-muted">JAWABAN SISWA</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-sm text-gray-200">
                      {so.tipe === "pilihan_ganda"
                        ? (so.opsi.find((o) => o.label === jwb)
                            ? `${jwb}. ${so.opsi.find((o) => o.label === jwb)?.teks}`
                            : jwb || "(kosong)")
                        : jwb || "(kosong)"}
                    </p>

                    {so.tipe !== "essay" && (
                      <p className="mt-2 text-xs text-muted">Kunci: {so.kunciJawaban || "-"}</p>
                    )}

                    <div className="mt-4 flex items-center gap-3">
                      <label className="text-xs font-medium tracking-wide text-muted">SKOR (0–{so.bobot})</label>
                      <input
                        type="number"
                        min={0}
                        max={so.bobot}
                        value={skor[so.id] ?? 0}
                        onChange={(e) => setSkor({ ...skor, [so.id]: Number(e.target.value) })}
                        className="w-24 rounded-xl border border-border bg-black/30 px-3 py-2 text-sm text-gray-200 outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                );
              })}

              {error && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {error}</p>}

              <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm text-muted">
                  Nilai akhir: <span className="text-2xl font-bold text-primary">{prediksi}</span> / 100
                </p>
                <button
                  onClick={simpan}
                  disabled={saving}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan Nilai"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Toast open={toast} onClose={() => setToast(false)} message="Nilai berhasil disimpan" />
    </div>
  );
}