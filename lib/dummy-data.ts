export type Kelas = {
  id: string;
  grade: "X" | "XI" | "XII";
  name: string;
  category: string;
  waliKelas: string;
  jumlahSiswa: number;
  kapasitas: number;
  tahunAjaran: string;
};

export type Siswa = {
  id: string;
  nama: string;
  nis: string;
  email: string;
  gender: "Laki-laki" | "Perempuan";
  password: string;
};

export const waliKelasOptions = [
  "Dr. Aris Setiawan, M.Pd",
  "Siti Aminah, M.Pd.",
  "Prof. Dr. Antonius S.",
  "Reza Pahlevi, S.Si.",
  "Harry Ambari S, Pd.",
];

export let kelasList: Kelas[] = [
  { id: "1", grade: "X", name: "MIPA 1", category: "Science & Tech", waliKelas: "Dr. Aris Setiawan, M.Pd", jumlahSiswa: 4, kapasitas: 36, tahunAjaran: "2023/2024" },
  { id: "2", grade: "XI", name: "IPS 2", category: "Social Studies", waliKelas: "Siti Aminah, M.Pd.", jumlahSiswa: 0, kapasitas: 32, tahunAjaran: "2023/2024" },
  { id: "3", grade: "XII", name: "Bahasa", category: "Linguistics", waliKelas: "Prof. Dr. Antonius S.", jumlahSiswa: 0, kapasitas: 30, tahunAjaran: "2023/2024" },
  { id: "4", grade: "X", name: "MIPA 2", category: "Science & Tech", waliKelas: "Reza Pahlevi, S.Si.", jumlahSiswa: 0, kapasitas: 36, tahunAjaran: "2023/2024" },
];

export let siswaByKelas: Record<string, Siswa[]> = {
  "1": [
    { id: "s1", nama: "Aditya Surya Pratama", nis: "202401001", email: "aditya.surya@aetheris.edu", gender: "Laki-laki", password: "siswa123" },
    { id: "s2", nama: "Bella Novita Sari", nis: "202401002", email: "bella.novita@aetheris.edu", gender: "Perempuan", password: "siswa123" },
    { id: "s3", nama: "Dimas Ramadhan", nis: "202401003", email: "dimas.ramadhan@aetheris.edu", gender: "Laki-laki", password: "siswa123" },
    { id: "s4", nama: "Elena Laksmi", nis: "202401004", email: "elena.laksmi@aetheris.edu", gender: "Perempuan", password: "siswa123" },
  ],
};

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function getKelasById(id: string) {
  return kelasList.find((k) => k.id === id);
}

let kelasIdCounter = kelasList.length;
export function addKelas(data: Omit<Kelas, "id" | "jumlahSiswa">) {
  kelasIdCounter += 1;
  const newKelas: Kelas = { id: String(kelasIdCounter), jumlahSiswa: 0, ...data };
  kelasList = [...kelasList, newKelas];
  siswaByKelas[newKelas.id] = [];
  return newKelas;
}

export function updateKelas(id: string, data: Partial<Kelas>) {
  const idx = kelasList.findIndex((k) => k.id === id);
  if (idx !== -1) kelasList[idx] = { ...kelasList[idx], ...data };
}

export function deleteKelas(id: string) {
  kelasList = kelasList.filter((k) => k.id !== id);
  delete siswaByKelas[id];
}

let siswaIdCounter = 100;
export function addSiswa(kelasId: string, data: Omit<Siswa, "id">) {
  siswaIdCounter += 1;
  const newSiswa: Siswa = { id: String(siswaIdCounter), ...data };
  if (!siswaByKelas[kelasId]) siswaByKelas[kelasId] = [];
  siswaByKelas[kelasId] = [...siswaByKelas[kelasId], newSiswa];
  const k = getKelasById(kelasId);
  if (k) k.jumlahSiswa += 1;
  return newSiswa;
}

export function updateSiswa(kelasId: string, siswaId: string, data: Partial<Siswa>) {
  const list = siswaByKelas[kelasId];
  if (!list) return;
  const idx = list.findIndex((s) => s.id === siswaId);
  if (idx !== -1) list[idx] = { ...list[idx], ...data };
}

export function deleteSiswa(kelasId: string, siswaId: string) {
  const list = siswaByKelas[kelasId];
  if (!list) return;
  siswaByKelas[kelasId] = list.filter((s) => s.id !== siswaId);
  const k = getKelasById(kelasId);
  if (k) k.jumlahSiswa = Math.max(0, k.jumlahSiswa - 1);
}

// ===== Guru & Mata Pelajaran =====

export type Guru = {
  id: string;
  nama: string;
  nip: string;
  email: string;
  mapel: string;
  password: string;
};

export type MataPelajaran = {
  id: string;
  nama: string;
  guruPengampu: string;
};

export let guruList: Guru[] = [
  { id: "g1", nama: "Ahmad Hidayat, S.Pd., M.Si.", nip: "198005122005011004", email: "ahmad.h@aetheris.edu", mapel: "Matematika", password: "guru123" },
  { id: "g2", nama: "Siti Wahyuni, M.Pd.", nip: "198511202010012008", email: "siti.w@aetheris.edu", mapel: "Bahasa Inggris", password: "guru123" },
  { id: "g3", nama: "Budi Pratama, S.Kom.", nip: "199003152015041002", email: "budi.p@aetheris.edu", mapel: "Informatika", password: "guru123" },
];

export let mapelList: MataPelajaran[] = [
  { id: "m1", nama: "Matematika Lanjut", guruPengampu: "Dr. Budi Santoso" },
  { id: "m2", nama: "Fisika Kuantum", guruPengampu: "Prof. Siti Aminah" },
  { id: "m3", nama: "Sastra Indonesia", guruPengampu: "Andi Wijaya, M. Pd" },
];

let guruIdCounter = guruList.length;
export function addGuru(data: Omit<Guru, "id">) {
  guruIdCounter += 1;
  const newGuru: Guru = { id: `g${guruIdCounter}`, ...data };
  guruList = [...guruList, newGuru];
  return newGuru;
}

export function getGuruById(id: string) {
  return guruList.find((g) => g.id === id);
}

export function updateGuru(id: string, data: Partial<Guru>) {
  const idx = guruList.findIndex((g) => g.id === id);
  if (idx !== -1) guruList[idx] = { ...guruList[idx], ...data };
}

export function deleteGuru(id: string) {
  guruList = guruList.filter((g) => g.id !== id);
}

let mapelIdCounter = mapelList.length;
export function addMapel(data: Omit<MataPelajaran, "id">) {
  mapelIdCounter += 1;
  const newMapel: MataPelajaran = { id: `m${mapelIdCounter}`, ...data };
  mapelList = [...mapelList, newMapel];
  return newMapel;
}

export function updateMapel(id: string, data: Partial<MataPelajaran>) {
  const idx = mapelList.findIndex((m) => m.id === id);
  if (idx !== -1) mapelList[idx] = { ...mapelList[idx], ...data };
}

export function deleteMapel(id: string) {
  mapelList = mapelList.filter((m) => m.id !== id);
}

export function getMapelNames() {
  return mapelList.map((m) => m.nama);
}

export function getGuruNames() {
  return guruList.map((g) => g.nama);
}

const badgeColors = [
  "bg-emerald-400/10 text-emerald-300",
  "bg-sky-400/10 text-sky-300",
  "bg-violet-400/10 text-violet-300",
  "bg-amber-400/10 text-amber-300",
  "bg-pink-400/10 text-pink-300",
];

export function getBadgeColor(index: number) {
  return badgeColors[index % badgeColors.length];
}

const avatarColors = [
  "from-violet-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
];

export function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length];
}

// ===== Aktivitas Guru =====

export type JenisAktivitas = "Upload Materi" | "Membuat Assessment" | "Menilai Tugas";

export type AktivitasGuru = {
  id: string;
  tanggal: string;
  waktu: string;
  idGuru: string;
  namaGuru: string;
  jenis: JenisAktivitas;
  keterangan: string;
};

export const aktivitasGuruList: AktivitasGuru[] = [
  { id: "a1", tanggal: "12 Agustus 2026", waktu: "08:30", idGuru: "GR001", namaGuru: "Budi Santoso", jenis: "Upload Materi", keterangan: "Pemrograman Web" },
  { id: "a2", tanggal: "12 Agustus 2026", waktu: "09:15", idGuru: "GR002", namaGuru: "Andi Pratama", jenis: "Membuat Assessment", keterangan: "Kuis HTML" },
  { id: "a3", tanggal: "12 Agustus 2026", waktu: "10:20", idGuru: "GR001", namaGuru: "Budi Santoso", jenis: "Menilai Tugas", keterangan: "Project Website" },
  { id: "a4", tanggal: "11 Agustus 2026", waktu: "14:30", idGuru: "GR001", namaGuru: "Budi Santoso", jenis: "Upload Materi", keterangan: "JavaScript Dasar" },
  { id: "a5", tanggal: "11 Agustus 2026", waktu: "11:00", idGuru: "GR002", namaGuru: "Andi Pratama", jenis: "Upload Materi", keterangan: "Struktur Data" },
  { id: "a6", tanggal: "10 Agustus 2026", waktu: "13:45", idGuru: "GR002", namaGuru: "Andi Pratama", jenis: "Menilai Tugas", keterangan: "Tugas Query SQL" },
];

export type GuruProfile = {
  idGuru: string;
  namaGuru: string;
  mapel: string;
  email: string;
};

export const guruProfiles: GuruProfile[] = [
  { idGuru: "GR001", namaGuru: "Budi Santoso", mapel: "Pemrograman Web", email: "budi.santoso@example.com" },
  { idGuru: "GR002", namaGuru: "Andi Pratama", mapel: "Basis Data", email: "andi.pratama@example.com" },
];

export function getGuruProfile(idGuru: string) {
  return guruProfiles.find((g) => g.idGuru === idGuru);
}

export function getRiwayatByGuru(idGuru: string) {
  return aktivitasGuruList.filter((a) => a.idGuru === idGuru);
}

const jenisBadgeMap: Record<JenisAktivitas, string> = {
  "Upload Materi": "bg-cyan-400/10 text-cyan-300",
  "Membuat Assessment": "bg-violet-400/10 text-violet-300",
  "Menilai Tugas": "bg-indigo-400/10 text-indigo-300",
};
export function getJenisBadge(jenis: JenisAktivitas) {
  return jenisBadgeMap[jenis];
}

const jenisDotMap: Record<JenisAktivitas, string> = {
  "Upload Materi": "bg-cyan-300",
  "Membuat Assessment": "bg-violet-300",
  "Menilai Tugas": "bg-indigo-300",
};
export function getJenisDot(jenis: JenisAktivitas) {
  return jenisDotMap[jenis];
}