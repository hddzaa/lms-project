export const JURUSAN = [
  { kode: "PPLG", nama: "Pengembangan Perangkat Lunak dan Gim" },
  { kode: "TJKT", nama: "Teknik Jaringan Komputer dan Telekomunikasi" },
  { kode: "MPLB", nama: "Manajemen Perkantoran dan Layanan Bisnis" },
  { kode: "PM", nama: "Pemasaran" },
  { kode: "DKV", nama: "Desain Komunikasi Visual" },
  { kode: "PH", nama: "Perhotelan" },
] as const;

export type KodeJurusan = (typeof JURUSAN)[number]["kode"];

export function namaJurusan(kode: string) {
  return JURUSAN.find((j) => j.kode === kode)?.nama ?? kode;
}