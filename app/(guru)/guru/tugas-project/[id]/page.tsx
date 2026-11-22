"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LampiranList from "@/components/tugas/LampiranList";

type Sub = {
  _id: string;
  siswaId: { nama: string; nis: string } | null;
  files: { name: string; url: string }[];
  catatan: string;
  status: "dikumpulkan" | "terlambat";
  nilai: number | null;
  komentar: string;
  waktuKumpul: string;
};

export default function DetailTugasGuruPage() {
  const { id } = useParams<{ id: string }>();
  const [tugas, setTugas] = useState<any>(null);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [edit, setEdit] = useState<Record<string, { nilai: string; komentar: string }>>({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(`/api/guru/tugas/${id}`);
    if (res.ok) {
      const d = await res.json();
      setTugas(d.tugas);
      setSubs(d.submissions);
      const init: any = {};
      d.submissions.forEach((s: Sub) => {
        init[s._id] = { nilai: s.nilai ?? "", komentar: s.komentar || "" };
      });
      setEdit(init);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const simpan = async (sid: string) => {
    const res = await fetch(`/api/guru/tugas/${id}/nilai`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: sid, ...edit[sid] }),
    });
    setMsg(res.ok ? "Nilai berhasil disimpan" : (await res.json()).error || "Gagal menyimpan");
    setTimeout(() => setMsg(""), 2500);
    if (res.ok) load();
  };

  const input = "rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus:border-cyan-400";

  if (loading) return <div className="p-8 opacity-70">Memuat...</div>;
  if (!tugas) return <div className="p-8">Tugas tidak ditemukan.</div>;

  return (
    <div className="p-6 md:p-8">
      <Link href="/guru/tugas-project" className="text-sm text-cyan-300 hover:underline">← Kembali</Link>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="rounded-full bg-cyan-400/20 px-2.5 py-1 font-semibold capitalize text-cyan-300">{tugas.jenis}</span>
          <Link
            href={`/guru/tugas-project/${id}/edit?from=detail`}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/10"
          >
            Edit Tugas
          </Link>
        </div>
        <h1 className="text-2xl font-bold">{tugas.judul}</h1>
        <p className="mt-1 text-sm opacity-70">{tugas.mapel} • {tugas.kelasId?.grade} {tugas.kelasId?.name}</p>
        {tugas.deskripsi && <p className="mt-3 whitespace-pre-line text-sm opacity-90">{tugas.deskripsi}</p>}

        <LampiranList files={tugas.files} judul="FILE SOAL" />

        <p className="mt-3 text-sm opacity-80">
          Deadline: {new Date(tugas.deadline).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" })}
        </p>
      </div>

      <h2 className="mb-3 mt-6 text-lg font-semibold">Pengumpulan ({subs.length})</h2>

      {subs.length === 0 ? (
        <p className="rounded-2xl border border-white/10 p-8 text-center opacity-70">Belum ada siswa yang mengumpulkan.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-white/10 text-xs uppercase">
              <tr>
                <th className="p-3">Siswa</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">File & Catatan</th>
                <th className="p-3">Nilai (0-100)</th>
                <th className="p-3">Komentar</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s._id} className="border-t border-white/10 align-top">
                  <td className="p-3">
                    <p className="font-medium">{s.siswaId?.nama || "-"}</p>
                    <p className="text-xs opacity-60">{s.siswaId?.nis}</p>
                  </td>
                  <td className="p-3">
                    <p>{new Date(s.waktuKumpul).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${s.status === "terlambat" ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                      {s.status === "terlambat" ? "Terlambat" : "Tepat waktu"}
                    </span>
                  </td>
                  <td className="p-3">
                    {s.files?.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" className="block text-cyan-300 hover:underline">📎 {f.name}</a>
                    ))}
                    {s.catatan && <p className="mt-1 text-xs opacity-70">“{s.catatan}”</p>}
                  </td>
                  <td className="p-3">
                    <input
                      type="number" min={0} max={100} className={`${input} w-20`}
                      value={edit[s._id]?.nilai ?? ""}
                      onChange={(e) => setEdit({ ...edit, [s._id]: { ...edit[s._id], nilai: e.target.value } })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className={`${input} w-56`} placeholder="Komentar"
                      value={edit[s._id]?.komentar ?? ""}
                      onChange={(e) => setEdit({ ...edit, [s._id]: { ...edit[s._id], komentar: e.target.value } })}
                    />
                  </td>
                  <td className="p-3">
                    <button onClick={() => simpan(s._id)} className="rounded-lg bg-cyan-400 px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90">
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {msg && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-cyan-400/40 bg-[#111827] px-5 py-3 text-sm text-white shadow-xl">✓ {msg}</div>
      )}
    </div>
  );
}