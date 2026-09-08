"use client";

import Modal from "@/components/ui/Modal";
import { FileUp, ClipboardList, FileCheck2 } from "lucide-react";
import { getGuruProfile, getRiwayatByGuru, type JenisAktivitas } from "@/lib/dummy-data";

const jenisIconMap: Record<JenisAktivitas, typeof FileUp> = {
  "Upload Materi": FileUp,
  "Membuat Assessment": ClipboardList,
  "Menilai Tugas": FileCheck2,
};

export default function DetailAktivitasModal({
  open,
  onClose,
  idGuru,
}: {
  open: boolean;
  onClose: () => void;
  idGuru: string | null;
}) {
  if (!idGuru) return null;

  const profile = getGuruProfile(idGuru);
  const riwayat = getRiwayatByGuru(idGuru);

  if (!profile) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-heading">Detail Aktivitas Guru</h3>
      </div>

      <p className="mb-3 text-xs font-semibold tracking-wide text-primary">RINGKASAN GURU</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/30 px-4 py-3">
          <p className="text-xs text-muted">Nama Guru</p>
          <p className="mt-1 font-semibold text-white">{profile.namaGuru}</p>
        </div>
        <div className="rounded-xl bg-black/30 px-4 py-3">
          <p className="text-xs text-muted">ID Guru</p>
          <p className="mt-1 font-semibold text-white">{profile.idGuru}</p>
        </div>
        <div className="rounded-xl bg-black/30 px-4 py-3">
          <p className="text-xs text-muted">Mata Pelajaran</p>
          <p className="mt-1 font-semibold text-white">{profile.mapel}</p>
        </div>
        <div className="rounded-xl bg-black/30 px-4 py-3">
          <p className="text-xs text-muted">Email</p>
          <p className="mt-1 font-semibold text-white">{profile.email}</p>
        </div>
      </div>

      <p className="mb-3 mt-6 text-xs font-semibold tracking-wide text-primary">
        RIWAYAT AKTIVITAS TERAKHIR
      </p>
      <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
        {riwayat.map((r) => {
          const Icon = jenisIconMap[r.jenis];
          return (
            <div key={r.id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5">
                <Icon size={16} className="text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {r.jenis} - {r.keterangan}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {r.tanggal}, {r.waktu}
                </p>
              </div>
            </div>
          );
        })}
        {riwayat.length === 0 && (
          <p className="text-sm text-muted">Belum ada riwayat aktivitas.</p>
        )}
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        <button
          onClick={onClose}
          className="rounded-full border border-border px-6 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
}