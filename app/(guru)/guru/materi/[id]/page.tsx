"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Link2, Eye, Download, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { getFileMeta, formatFileSize } from "@/lib/materiHelpers";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

type MateriDetail = {
  id: string;
  judul: string;
  mapel: string;
  kelasLabel: string;
  deskripsi: string;
  guruNama: string;
  files: { name: string; url: string; size: number }[];
  status: string;
  createdAt: string;
};

export default function DetailMateriPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [materi, setMateri] = useState<MateriDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function fetchDetail() {
    setLoading(true);
    const res = await fetch(`/api/materi/${params.id}`);
    if (res.ok) setMateri(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchDetail();
  }, [params.id]);

  async function handleAddFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    setUploading(true);
    await fetch(`/api/materi/${params.id}/files`, { method: "POST", body: formData });
    setUploading(false);
    fetchDetail();
  }

  async function handleDelete() {
    await fetch(`/api/materi/${params.id}`, { method: "DELETE" });
    router.push("/guru/materi");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" /> Memuat materi...
      </div>
    );
  }

  if (!materi) {
    return (
      <div className="text-muted">
        Materi tidak ditemukan.{" "}
        <Link href="/guru/materi" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/guru/materi" className="mb-4 flex items-center gap-2 text-sm text-gray-300 hover:text-white">
        <ArrowLeft size={15} /> Kembali ke Daftar Materi
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-3 flex gap-2">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{materi.mapel}</span>
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-medium text-secondary">{materi.kelasLabel}</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{materi.judul}</h1>

        <div className="mt-6 flex flex-wrap gap-10 border-t border-border pt-5">
          <div>
            <p className="text-xs text-muted">PENGAJAR</p>
            <p className="mt-1 font-semibold text-white">{materi.guruNama}</p>
          </div>
          <div>
            <p className="text-xs text-muted">TANGGAL UPLOAD</p>
            <p className="mt-1 font-semibold text-white">
              {new Date(materi.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">STATUS</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {materi.status}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <FileText size={18} className="text-primary" /> Deskripsi Materi
          </h3>
          <p className="whitespace-pre-line text-sm text-gray-300">{materi.deskripsi || "Belum ada deskripsi."}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <Link2 size={18} className="text-primary" /> File Materi
          </h3>
          <div className="space-y-3">
            {materi.files.map((f, i) => {
              const meta = getFileMeta(f.name);
              const Icon = meta.icon;
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-black/20 p-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{f.name}</p>
                    <p className="text-xs text-muted">{formatFileSize(f.size)}</p>
                  </div>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-200"><Eye size={16} /></a>
                  <a href={f.url} download className="text-gray-400 hover:text-gray-200"><Download size={16} /></a>
                </div>
              );
            })}
            {materi.files.length === 0 && <p className="text-sm text-muted">Belum ada file.</p>}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              <Plus size={15} /> {uploading ? "Mengupload..." : "Tambah File Baru"}
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAddFile} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          <Trash2 size={15} /> Hapus Materi
        </button>
        <Link
          href={`/guru/materi/${materi.id}/edit`}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-105"
        >
          <Pencil size={15} /> Edit Materi
        </Link>
      </div>

      <ConfirmDeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemLabel={`materi "${materi.judul}"`}
      />
    </div>
  );
}