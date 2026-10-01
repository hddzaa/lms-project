"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Link2, Eye, Download, Loader2 } from "lucide-react";
import { getFileMeta, formatFileSize } from "@/lib/materiHelpers";

type MateriDetail = {
  id: string;
  judul: string;
  mapel: string;
  deskripsi: string;
  guruNama: string;
  files: { name: string; url: string; size: number }[];
  createdAt: string;
};

export default function SiswaDetailMateriPage() {
  const params = useParams<{ id: string }>();
  const [materi, setMateri] = useState<MateriDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/siswa/materi/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setMateri(d))
      .finally(() => setLoading(false));
  }, [params.id]);

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
        <Link href="/siswa/materi" className="text-primary hover:underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/siswa/materi" className="mb-4 flex items-center gap-2 text-sm text-gray-300 hover:text-white">
        <ArrowLeft size={15} /> Kembali ke Daftar Materi
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-8">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">{materi.mapel}</span>
        <h1 className="mt-3 text-3xl font-bold text-white">{materi.judul}</h1>

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
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <FileText size={18} className="text-primary" /> Deskripsi Materi
          </h3>
          <p className="whitespace-pre-line text-sm text-gray-300">{materi.deskripsi || "Tidak ada deskripsi."}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <Link2 size={18} className="text-primary" /> File Materi
          </h3>
          <div className="space-y-3">
            {materi.files.map((f, i) => {
              const meta = getFileMeta(f.name);
              const Icon = meta.icon;
              const isPdf = f.name.toLowerCase().endsWith(".pdf");
              return (
                <div key={i} className="rounded-xl bg-black/20 p-3">
                  <div className="flex items-center gap-3">
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
                  {isPdf && (
                    <embed src={f.url} type="application/pdf" className="mt-3 h-72 w-full rounded-lg border border-border" />
                  )}
                </div>
              );
            })}
            {materi.files.length === 0 && <p className="text-sm text-muted">Tidak ada file.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}