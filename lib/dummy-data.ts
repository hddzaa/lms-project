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
};

export const guruList = [
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
    { id: "s1", nama: "Aditya Surya Pratama", nis: "202401001", email: "aditya.surya@aetheris.edu", gender: "Laki-laki" },
    { id: "s2", nama: "Bella Novita Sari", nis: "202401002", email: "bella.novita@aetheris.edu", gender: "Perempuan" },
    { id: "s3", nama: "Dimas Ramadhan", nis: "202401003", email: "dimas.ramadhan@aetheris.edu", gender: "Laki-laki" },
    { id: "s4", nama: "Elena Laksmi", nis: "202401004", email: "elena.laksmi@aetheris.edu", gender: "Perempuan" },
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
  kelasList.push(newKelas);
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
  siswaByKelas[kelasId].push(newSiswa);
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