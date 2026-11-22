"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, UploadCloud, AlertCircle, X, FileText, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

type Opsi = { kelasId: string; grade: string; name: string; mapel: string };
type FileLama = { name: string; url: string; size?: number };

const BATAS_BYTE = 4 * 1024 * 1024;

const jenisOptions = [
  { value: "tugas", label: "Tugas", desc: "Latihan atau pekerjaan rumah" },
  { value: "project", label: "Project", desc: "Proyek dengan hasil karya" },
];

function keInputLocal(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
}

function formatUkuran(b?: number) {
  if (!b) return "";
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + " MB";
  return Math.round(b / 1024) + " KB";
}

export default function FormTugas({ tugasId }: { tugasId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const edit = Boolean(tugasId);

  const dariDetail = edit && searchParams.get("from") === "detail";
  const kembaliHref = dariDetail ? "/guru/tugas-project/" + tugasId : "/guru/tugas-project";

  const [loading, setLoading] = useState<boolean>(edit);
  const [opsi, setOpsi] = useState<Opsi[]>([]);
  const [judul, setJudul] = useState<string>("");
  const [jenis, setJenis] = useState<string>("tugas");
  const [mapel, setMapel] = useState<string>("");
  const [kelasId, setKelasId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [fileLama, setFileLama] = useState<FileLama[]>([]);
  const [hapus, setHapus] = useState<string[]>([]);
  const [fileBaru, setFileBaru] = useState<File[]>([]);
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);

  const mapelOptions = Array.from(new Set([...opsi.map((o) => o.mapel), ...(mapel ? [mapel] : [])]));

  useEffect(() => {
    async function load() {
      const opsiRes = await fetch("/api/guru/mapel-kelas");
      const opsiData = await opsiRes.json();
      if (Array.isArray(opsiData)) {
        setOpsi(opsiData);
        const m = Array.from(new Set(opsiData.map((o: Opsi) => o.mapel)));
        if (!edit && m.length === 1) setMapel(m[0] as string);
      }

      if (edit) {
        const res = await fetch("/api/guru/tugas/" + tugasId);
        if (res.ok) {
          const data = await res.json();
          const tugas = data.tugas;
          setJudul(tugas.judul);
          setJenis(tugas.jenis);
          setMapel(tugas.mapel);
          setKelasId(tugas.kelasId && tugas.kelasId._id ? tugas.kelasId._id : tugas.kelasId);
          setDeadline(keInputLocal(tugas.deadline));
          setDeskripsi(tugas.deskripsi || "");
          setFileLama(tugas.files || []);
        }
        setLoading(false);
      }
    }
    load();
  }, [edit, tugasId]);

  function tambahFile(list: File[]) {
    setFileBaru((prev) => [...prev, ...list]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!judul || !mapel || !kelasId || !deadline) {
      setError("Judul, Mata Pelajaran, Kelas, dan Deadline wajib diisi");
      return;
    }
    const total = fileBaru.reduce((a, f) => a + f.size, 0);
    if (total > BATAS_BYTE) {
      setError("Total ukuran file baru maksimal 4 MB");
      return;
    }

    const fd = new FormData();
    fd.append("judul", judul);
    fd.append("jenis", jenis);
    fd.append("mapel", mapel);
    fd.append("kelasId", kelasId);
    fd.append("deadline", new Date(deadline).toISOString());
    fd.append("deskripsi", deskripsi);
    if (edit) fd.append("hapus", JSON.stringify(hapus));
    fileBaru.forEach((f) => fd.append("files", f));

    setSubmitting(true);
    const url = edit ? "/api/guru/tugas/" + tugasId : "/api/guru/tugas";
    const res = await fetch(url, { method: edit ? "PUT" : "POST", body: fd });
    setSubmitting(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Gagal menyimpan.");
      return;
    }
    setToast(true);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat data...
      </div>
    );
  }

  return (
    <div>
      <Link href={kembaliHref} className="animate-fade-in-up mb-4 inline-block text-sm text-muted hover:text-white">
        ← Kembali
      </Link>
      <h1 className="animate-fade-in-up text-3xl font-bold text-white">
        {edit ? "Edit Tugas / Project" : "Buat Tugas / Project"}
      </h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "40ms" }}>
        Isi detail tugas. Kamu bisa melampirkan file soal agar siswa bisa melihatnya.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="animate-fade-in-up flex-1 rounded-2xl border border-border bg-surface p-8" style={{ animationDelay: "80ms" }}>
          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JUDUL</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            type="text"
            placeholder="Contoh: Tugas Query SQL Bab 3"
            className="mb-6 w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-muted">MATA PELAJARAN</label>
              <div className="relative">
                <select
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                >
                  <option value="">Pilih Mapel</option>
                  {mapelOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium tracking-wide text-muted">KELAS</label>
              <div className="relative">
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 outline-none focus:border-primary/50"
                >
                  <option value="">Pilih Kelas</option>
                  {opsi.map((k) => (
                    <option key={k.kelasId} value={k.kelasId}>
                      {k.grade} {k.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DESKRIPSI / INSTRUKSI</label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={6}
            placeholder="Tuliskan instruksi pengerjaan untuk siswa..."
            className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={13} /> {error}
            </p>
          )}
        </div>

        <div className="w-full space-y-4 lg:w-80">
          <div className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6" style={{ animationDelay: "120ms" }}>
            <p className="mb-4 text-xs font-medium tracking-wide text-muted">JENIS</p>
            <div className="space-y-2">
              {jenisOptions.map((j) => (
                <button
                  key={j.value}
                  type="button"
                  onClick={() => setJenis(j.value)}
                  className={
                    "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors " +
                    (jenis === j.value ? "border-primary/50 bg-primary-soft" : "border-border hover:bg-white/5")
                  }
                >
                  <span
                    className={
                      "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 " +
                      (jenis === j.value ? "border-primary bg-primary" : "border-gray-500")
                    }
                  />
                  <span>
                    <p className="text-sm font-semibold text-white">{j.label}</p>
                    <p className="text-xs text-muted">{j.desc}</p>
                  </span>
                </button>
              ))}
            </div>

            <label className="mb-2 mt-5 block text-xs font-medium tracking-wide text-muted">DEADLINE</label>
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              type="datetime-local"
              className="w-full rounded-xl border border-border bg-black/30 px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              tambahFile(Array.from(e.dataTransfer.files));
            }}
            className={
              "animate-fade-in-up rounded-2xl border-2 border-dashed p-6 text-center transition-colors " +
              (dragging ? "border-primary bg-primary-soft" : "border-border bg-surface")
            }
            style={{ animationDelay: "160ms" }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary">
              <UploadCloud size={22} />
            </div>
            <p className="font-medium text-white">File Soal (opsional)</p>
            <p className="mt-1 text-xs text-muted">Seret file ke sini atau pilih dari penyimpanan. Maks 4 MB.</p>
            <label className="mt-4 inline-block cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/5">
              Pilih File
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => tambahFile(Array.from(e.target.files ?? []))}
              />
            </label>

            {(fileLama.length > 0 || fileBaru.length > 0) && (
              <ul className="mt-4 space-y-1.5 text-left text-xs">
                {fileLama
                  .filter((f) => !hapus.includes(f.url))
                  .map((f) => (
                    <li key={f.url} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-gray-300">
                      <FileText size={13} className="shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setHapus((h) => [...h, f.url])}
                        className="text-muted hover:text-red-400"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                {fileBaru.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-gray-300">
                    <FileText size={13} className="shrink-0 text-emerald-400" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="text-muted">{formatUkuran(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFileBaru((p) => p.filter((_, x) => x !== i))}
                      className="text-muted hover:text-red-400"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <Link
          href={kembaliHref}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
        >
          Batal
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : edit ? "Simpan Perubahan" : "Simpan Tugas"}
        </button>
      </div>

      <Toast
        open={toast}
        onClose={() => {
          setToast(false);
          router.push(kembaliHref);
        }}
        message={edit ? "Tugas berhasil diperbarui" : "Tugas berhasil dibuat"}
      />
    </div>
  );
}