"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Upload } from "lucide-react";

type Detail = {
  tugas: { id: string; judul: string; deskripsi: string; jenis: string; mode: string; mapel: string; guruNama: string; deadline: string };
  submission: {
    files: { name: string; url: string }[];
    catatan: string;
    status: "dikumpulkan" | "terlambat";
    nilai: number | null;
    komentar: string;
    waktuKumpul: string;
  } | null;
};

export default function SiswaDetailTugasPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [catatan, setCatatan] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const res = await fetch(`/api/siswa/tugas/${id}`);
    if (res.ok) {
      const d: Detail = await res.json();
      setData(d);
      setCatatan(d.submission?.catatan || "");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function kumpul(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    const fd = new FormData();
    fd.append("catatan", catatan);
    files.forEach((f) => fd.append("files", f));
    const res = await fetch(`/api/siswa/tugas/${id}`, { method: "POST", body: fd });
    setSending(false);
    if (!res.ok) {
      setError((await res.json()).error || "Gagal mengumpulkan");
      return;
    }
    setFiles([]);
    setToast("Tugas berhasil dikumpulkan");
    setTimeout(() => setToast(""), 2500);
    load();
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat...
      </div>
    );
  if (!data)
    return (
      <div className="text-muted">
        Tugas tidak ditemukan. <Link href="/siswa/tugas-project" className="text-primary hover:underline">Kembali</Link>
      </div>
    );

  const { tugas, submission } = data;
  const dinilai = submission && submission.nilai !== null && submission.nilai !== undefined;
  const lewat = new Date(tugas.deadline) < new Date();

  return (
    <div>
      <Link href="/siswa/tugas-project" className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-gray-200">
        <ChevronLeft size={15} /> Kembali
      </Link>

      <div className="animate-fade-in-up mt-4 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium capitalize text-primary">{tugas.jenis}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize text-gray-300">{tugas.mode}</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{tugas.judul}</h1>
        <p className="mt-1 text-sm text-muted">{tugas.mapel} · Oleh {tugas.guruNama}</p>
        {tugas.deskripsi && <p className="mt-4 whitespace-pre-line text-sm text-gray-300">{tugas.deskripsi}</p>}
        <p className={`mt-4 text-sm ${lewat ? "text-red-400" : "text-gray-300"}`}>
          Deadline: {new Date(tugas.deadline).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" })}
        </p>
      </div>

      {submission && (
        <div className="animate-fade-in-up mt-5 rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "60ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Pengumpulan Anda</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${submission.status === "terlambat" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {submission.status === "terlambat" ? "Terlambat" : "Tepat waktu"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Dikumpulkan {new Date(submission.waktuKumpul).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}
          </p>
          <div className="mt-3 space-y-1">
            {submission.files.map((f, i) => (
              <a key={i} href={f.url} target="_blank" className="block text-sm text-primary hover:underline">📎 {f.name}</a>
            ))}
          </div>
          {submission.catatan && <p className="mt-3 text-sm text-gray-300">“{submission.catatan}”</p>}

          {dinilai && (
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary-soft p-4">
              <p className="text-xs tracking-wide text-muted">NILAI</p>
              <p className="text-3xl font-bold text-primary">{submission.nilai}</p>
              {submission.komentar && (
                <>
                  <p className="mt-3 text-xs tracking-wide text-muted">KOMENTAR GURU</p>
                  <p className="text-sm text-gray-200">{submission.komentar}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!dinilai && (
        <form onSubmit={kumpul} className="animate-fade-in-up mt-5 rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-white">{submission ? "Kumpulkan Ulang" : "Kumpulkan Tugas"}</h2>
          {lewat && <p className="mt-1 text-xs text-red-400">Deadline sudah lewat, pengumpulan akan ditandai Terlambat.</p>}

          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-black/20 px-4 py-8 text-sm text-gray-300 transition-colors hover:border-primary/50">
            <Upload size={18} />
            {files.length > 0 ? `${files.length} file dipilih` : "Pilih file (maks. 20 MB per file)"}
            <input type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {files.map((f, i) => (<li key={i}>• {f.name}</li>))}
            </ul>
          )}

          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={3}
            placeholder="Catatan untuk guru (opsional)"
            className="mt-4 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={sending}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
          >
            {sending ? "Mengirim..." : "KUMPULKAN →"}
          </button>
        </form>
      )}

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-primary/40 bg-surface px-5 py-3 text-sm text-white shadow-xl">✓ {toast}</div>
      )}
    </div>
  );
}