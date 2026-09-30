"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, UploadCloud, AlertCircle } from "lucide-react";
import SuccessModal from "@/components/ui/SuccessModal";

type Kelas = { id: string; grade: string; name: string };

export default function TambahMateriPage() {
  const router = useRouter();
  const [mapelOptions, setMapelOptions] = useState<string[]>([]);
  const [kelasOptions, setKelasOptions] = useState<Kelas[]>([]);
  const [judul, setJudul] = useState("");
  const [mapel, setMapel] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/mapel").then((r) => r.json()), fetch("/api/kelas").then((r) => r.json())]).then(
      ([mapelData, kelasData]) => {
        setMapelOptions(mapelData.map((m: any) => m.nama));
        setKelasOptions(kelasData.map((k: any) => ({ id: k.id, grade: k.grade, name: k.name })));
      }
    );
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!judul || !mapel || !kelasId) {
      setError("Judul, Mata Pelajaran, dan Kelas wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("mapel", mapel);
    formData.append("kelasId", kelasId);
    formData.append("deskripsi", deskripsi);
    files.forEach((f) => formData.append("files", f));

    setSubmitting(true);
    const res = await fetch("/api/materi", { method: "POST", body: formData });
    setSubmitting(false);

    if (!res.ok) {
      setError("Gagal menyimpan materi.");
      return;
    }
    setShowSuccess(true);
  }

  return (
    <div>
      <h1 className="animate-fade-in-up text-3xl font-bold text-primary">Upload Materi Baru</h1>
      <p className="animate-fade-in-up mt-2 max-w-2xl text-muted" style={{ animationDelay: "40ms" }}>
        Isi detail di bawah ini untuk menambahkan materi pembelajaran baru ke sistem Aetheris Academic.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="animate-fade-in-up flex-1 rounded-2xl border border-border bg-surface p-8" style={{ animationDelay: "80ms" }}>
          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">JUDUL MATERI</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            type="text"
            placeholder="Contoh: Pengenalan Aljabar Linear - Pertemuan 1"
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
                  {mapelOptions.map((m) => (<option key={m} value={m}>{m}</option>))}
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
                  {kelasOptions.map((k) => (<option key={k.id} value={k.id}>{k.grade} {k.name}</option>))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>

          <label className="mb-2 block text-xs font-medium tracking-wide text-muted">DESKRIPSI SINGKAT</label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={5}
            placeholder="Berikan ringkasan singkat mengenai konten materi ini..."
            className="w-full resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary/50"
          />

          {error && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle size={13} /> {error}</p>
          )}
        </div>

        <div className="w-full space-y-4 lg:w-80">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging ? "border-primary bg-primary-soft" : "border-border bg-surface"
            }`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary">
              <UploadCloud size={22} />
            </div>
            <p className="font-medium text-white">Drag & Drop Materi</p>
            <p className="mt-1 text-xs text-muted">Seret file ke sini atau klik untuk menelusuri penyimpanan lokal Anda.</p>
            <label className="mt-4 cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium text-gray-200 hover:bg-white/5">
              Pilih File
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-4 w-full space-y-1 text-left text-xs text-gray-300">
                {files.map((f, i) => (<li key={i} className="truncate">📎 {f.name}</li>))}
              </ul>
            )}
          </div>

          <div className="animate-fade-in-up rounded-2xl border border-border bg-surface p-5" style={{ animationDelay: "160ms" }}>
            <p className="mb-3 text-xs font-semibold tracking-wide text-primary">FORMAT DIDUKUNG</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span>📄 PDF, DOCX</span>
              <span>📊 PPTX</span>
              <span>🎬 MP4</span>
              <span>🗂 ZIP</span>
            </div>
            <p className="mt-3 text-xs text-muted">Maksimum ukuran file: 100MB</p>
          </div>
        </div>
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <Link href="/guru/materi" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5">
          Batal
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105 disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Simpan Materi"}
        </button>
      </div>

      <SuccessModal open={showSuccess} onClose={() => router.push("/guru/materi")} message="Materi berhasil diupload" />
    </div>
  );
}