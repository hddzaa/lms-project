"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import LampiranList from "@/components/tugas/LampiranList";
import Toast from "@/components/ui/Toast";

type FileItem = { name: string; url: string; size?: number };
type Tugas = {
  id: string;
  judul: string;
  deskripsi: string;
  jenis: string;
  mapel: string;
  guruNama: string;
  deadline: string;
  files: FileItem[];
};
type Submission = {
  files: FileItem[];
  catatan: string;
  status: string;
  nilai: number | null;
  komentar: string;
  waktuKumpul: string;
} | null;

const BATAS_BYTE = 4 * 1024 * 1024;

export default function SiswaDetailTugasPage() {
  const { id } = useParams<{ id: string }>();
  const [tugas, setTugas] = useState<Tugas | null>(null);
  const [sub, setSub] = useState<Submission>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fileBaru, setFileBaru] = useState<File[]>([]);
  const [catatan, setCatatan] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);

  async function load() {
    const res = await fetch("/api/siswa/tugas/" + id);
    if (res.ok) {
      const d = await res.json();
      setTugas(d.tugas);
      setSub(d.submission);
      setCatatan(d.submission && d.submission.catatan ? d.submission.catatan : "");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function kumpulkan(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const adaFileLama = sub && sub.files && sub.files.length > 0;
    if (fileBaru.length === 0 && !adaFileLama) {
      setError("Lampirkan minimal satu file");
      return;
    }
    if (fileBaru.reduce((a, f) => a + f.size, 0) > BATAS_BYTE) {
      setError("Total ukuran file maksimal 4 MB");
      return;
    }
    const fd = new FormData();
    fd.append("catatan", catatan);
    fileBaru.forEach((f) => fd.append("files", f));

    setSubmitting(true);
    const res = await fetch("/api/siswa/tugas/" + id, { method: "POST", body: fd });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Gagal mengumpulkan.");
      return;
    }
    setFileBaru([]);
    setToast(true);
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data...
      </div>
    );
  }
  if (!tugas) return <p className="text-muted">Tugas tidak ditemukan.</p>;

  const dinilai = sub !== null && sub.nilai !== null && sub.nilai !== undefined;

  return (
    <div>
      <Link href="/siswa/tugas-project" className="mb-4 inline-block text-sm text-muted hover:text-white">
        ← Kembali
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium capitalize text-primary">
              {tugas.jenis}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white">{tugas.judul}</h1>
            <p className="mt-1 text-sm text-muted">
              {tugas.mapel} · {tugas.guruNama}
            </p>
            <p className="mt-3 text-sm text-gray-300">
              Deadline:{" "}
              {new Date(tugas.deadline).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
            </p>

            <p className="mb-2 mt-6 text-xs font-medium tracking-wide text-muted">INSTRUKSI</p>
            <p className="whitespace-pre-wrap text-sm text-gray-200">
              {tugas.deskripsi || "Tidak ada instruksi tambahan."}
            </p>

            <p className="mb-2 mt-6 text-xs font-medium tracking-wide text-muted">FILE SOAL DARI GURU</p>
            {tugas.files.length > 0 ? (
              <LampiranList files={tugas.files} />
            ) : (
              <p className="text-sm text-muted">Guru tidak melampirkan file.</p>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-96">
          {dinilai && sub && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-xs font-medium tracking-wide text-emerald-300">NILAI</p>
              <p className="mt-1 text-4xl font-bold text-white">{sub.nilai}</p>
              {sub.komentar && <p className="mt-3 text-sm text-gray-200">{sub.komentar}</p>}
            </div>
          )}

          <form onSubmit={kumpulkan} className="rounded-2xl border border-border bg-surface p-6">
            <p className="mb-4 text-xs font-medium tracking-wide text-muted">PENGUMPULAN</p>

            {sub && (
              <div className="mb-4">
                <p className="mb-2 text-xs text-muted">
                  Dikumpulkan{" "}
                  {new Date(sub.waktuKumpul).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  {sub.status === "terlambat" ? " (terlambat)" : ""}
                </p>
                <LampiranList files={sub.files} />
              </div>
            )}

            {!dinilai && (
              <>
                <label className="mb-2 block cursor-pointer rounded-xl border-2 border-dashed border-border p-5 text-center hover:bg-white/5">
                  <UploadCloud size={22} className="mx-auto mb-2 text-primary" />
                  <span className="text-sm text-gray-200">{sub ? "Ganti file jawaban" : "Pilih file jawaban"}</span>
                  <p className="mt-1 text-xs text-muted">Maks 4 MB</p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setFileBaru(Array.from(e.target.files ?? []))}
                  />
                </label>

                {fileBaru.length > 0 && (
                  <ul className="mb-3 space-y-1.5 text-xs">
                    {fileBaru.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-gray-300">
                        <FileText size={13} className="shrink-0 text-emerald-400" />
                        <span className="min-w-0 flex-1 truncate">{f.name}</span>
                        <button type="button" onClick={() => setFileBaru((p) => p.filter((_, x) => x !== i))}>
                          <X size={13} className="text-muted hover:text-red-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Catatan untuk guru (opsional)"
                  className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
                />

                {error && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
                >
                  {submitting ? "Mengumpulkan..." : sub ? "Kumpulkan Ulang" : "Kumpulkan"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <Toast open={toast} onClose={() => setToast(false)} message="Tugas berhasil dikumpulkan" />
    </div>
  );
}