"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ListOrdered, Hash, Timer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

type Soal = {
  id: string;
  tipe: "pilihan_ganda" | "isian_singkat" | "essay";
  pertanyaan: string;
  opsi?: { label: string; teks: string }[];
  bobot: number;
  jawabanSaya: string;
  kunciJawaban?: string;
};

type AssessmentData = {
  id: string;
  judul: string;
  mapel: string;
  guruNama: string;
  durasiMenit: number;
  status: string;
  nilai: number | null;
  waktuMulai: string;
  soal: Soal[];
};

export default function KerjakanAssessmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/siswa/assessment/${params.id}`)
      .then((res) => res.json())
      .then((d: AssessmentData) => {
        setData(d);
        const initAnswers: Record<string, string> = {};
        d.soal.forEach((s) => (initAnswers[s.id] = s.jawabanSaya || ""));
        setAnswers(initAnswers);

        if (d.status === "Sedang Dikerjakan") {
          const elapsedSec = (Date.now() - new Date(d.waktuMulai).getTime()) / 1000;
          const totalSec = d.durasiMenit * 60;
          setTimeLeft(Math.max(0, Math.round(totalSec - elapsedSec)));
        }
        setLoading(false);
      });
  }, [params.id]);

  const isReadOnly = data?.status !== "Sedang Dikerjakan";

  useEffect(() => {
    if (isReadOnly || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [isReadOnly, timeLeft]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const res = await fetch(`/api/siswa/assessment/${params.id}/submit`, { method: "POST" });
    const result = await res.json();
    setSubmitting(false);
    setData((prev) => (prev ? { ...prev, status: result.status, nilai: result.nilai } : prev));
    router.push("/siswa/assessment");
  }, [params.id, router]);

  useEffect(() => {
    if (!isReadOnly && timeLeft === 0 && data) {
      handleSubmit();
    }
  }, [timeLeft, isReadOnly, data, handleSubmit]);

  async function handleAnswerChange(soalId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [soalId]: value }));
    await fetch(`/api/siswa/assessment/${params.id}/jawab`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soalId, jawaban: value }),
    });
  }

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat assessment...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-muted">
        Assessment tidak ditemukan.{" "}
        <Link href="/siswa/assessment" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  const soal = data.soal[current];

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/siswa/assessment" className="mt-1 text-primary hover:text-primary/80"><ArrowLeft size={22} /></Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{data.judul}</h1>
            <p className="mt-1 text-sm text-primary">{data.mapel} <span className="text-muted">•</span> <span className="text-gray-300">{data.guruNama}</span></p>
          </div>
        </div>
        <div className="text-right text-xs text-muted">
          <p className="flex items-center justify-end gap-1.5 text-gray-300">
            <span className={`h-2 w-2 rounded-full ${isReadOnly ? "bg-emerald-400" : "bg-primary"}`} />
            STATUS: {isReadOnly ? (data.status === "Perlu Dinilai" ? "MENUNGGU PENILAIAN" : "SELESAI") : "SEDANG DIKERJAKAN"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-t-2 border-border border-t-indigo-400 bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300"><ListOrdered size={16} /></span>
            <div><p className="text-xs text-muted">Jumlah Soal</p><p className="text-xl font-bold text-white">{data.soal.length}</p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-t-2 border-border border-t-primary bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Hash size={16} /></span>
            <div><p className="text-xs text-muted">Nomor Sekarang</p><p className="text-xl font-bold text-white">{current + 1} <span className="text-sm font-normal text-muted">/ {data.soal.length}</span></p></div>
          </div>
        </div>
        <div className="rounded-2xl border border-t-2 border-border border-t-rose-400 bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-400/10 text-rose-300"><Timer size={16} /></span>
            <div><p className="text-xs text-muted">Waktu Tersisa</p><p className="text-xl font-bold text-rose-300">{isReadOnly ? "--:--:--" : formatTime(timeLeft)}</p></div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-8">
        <p className="mb-3 text-xs font-semibold tracking-wide text-primary">SOAL NO. {current + 1}</p>
        <h2 className="text-xl font-semibold leading-relaxed text-white">{soal.pertanyaan}</h2>

        <div className="mt-6">
          {soal.tipe === "pilihan_ganda" && (
            <div className="space-y-3">
              {soal.opsi?.map((o) => {
                const selected = answers[soal.id] === o.label;
                const isCorrect = isReadOnly && soal.kunciJawaban === o.label;
                const isWrongSelected = isReadOnly && selected && soal.kunciJawaban !== o.label;
                return (
                  <button
                    key={o.label}
                    disabled={isReadOnly}
                    onClick={() => handleAnswerChange(soal.id, o.label)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                      isCorrect ? "border-emerald-400/50 bg-emerald-400/10" :
                      isWrongSelected ? "border-red-400/50 bg-red-400/10" :
                      selected ? "border-primary/50 bg-primary-soft" : "border-border hover:bg-white/5"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${selected ? "border-primary text-primary" : "border-gray-500 text-gray-400"}`}>{o.label}</span>
                    <span className="text-sm text-gray-200">{o.teks}</span>
                  </button>
                );
              })}
            </div>
          )}

          {soal.tipe === "isian_singkat" && (
            <>
              <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JAWABAN ANDA</label>
              <input
                value={answers[soal.id] || ""}
                onChange={(e) => handleAnswerChange(soal.id, e.target.value)}
                disabled={isReadOnly}
                type="text"
                placeholder="Ketik jawaban di sini..."
                className="w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50 disabled:opacity-60"
              />
              <p className="mt-2 text-xs italic text-muted">Catatan: Perhatikan ejaan dan penulisan istilah ilmiah dengan benar.</p>
              {isReadOnly && (
                <p className="mt-2 text-xs text-gray-400">Kunci jawaban: <span className="text-emerald-400">{soal.kunciJawaban}</span></p>
              )}
            </>
          )}

          {soal.tipe === "essay" && (
            <>
              <textarea
                value={answers[soal.id] || ""}
                onChange={(e) => handleAnswerChange(soal.id, e.target.value)}
                disabled={isReadOnly}
                rows={6}
                placeholder="Tulis jawaban essay di sini..."
                className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50 disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-muted">{(answers[soal.id] || "").trim().split(/\s+/).filter(Boolean).length} kata</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Sebelumnya
        </button>
        {current === data.soal.length - 1 ? (
          !isReadOnly && (
            <button onClick={() => setShowSubmitConfirm(true)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105">
              Selesai & Kumpulkan
            </button>
          )
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(data.soal.length - 1, c + 1))}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
          >
            Selanjutnya <ChevronRight size={15} />
          </button>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="mb-4 text-xs uppercase tracking-wide text-muted">Navigasi Seluruh Soal</p>
        <div className="flex flex-wrap justify-center gap-2">
          {data.soal.map((s, i) => {
            const answered = !!answers[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  i === current ? "bg-primary text-bg" :
                  answered ? "bg-emerald-500/20 text-emerald-300" : "border border-border text-gray-400 hover:bg-white/5"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmDeleteModal
        open={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        itemLabel={`assessment ini. Pastikan semua jawaban sudah terisi, Anda tidak bisa mengubahnya lagi setelah dikumpulkan`}
      />
    </div>
  );
}