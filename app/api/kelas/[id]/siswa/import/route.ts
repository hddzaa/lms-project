import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import Siswa from "@/models/Siswa";

function normalizeGender(value: string): "Laki-laki" | "Perempuan" {
  const v = (value || "").trim().toLowerCase();
  if (v.startsWith("l")) return "Laki-laki";
  return "Perempuan";
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: kelasId } = await context.params;
  await connectDB();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(bytes, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const results = { berhasil: 0, gagal: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nama = String(row["Nama Lengkap"] || "").trim();
    const nis = String(row["NIS"] || "").trim();
    const email = String(row["Email"] || "").trim();
    const genderRaw = String(row["Jenis Kelamin"] || "").trim();
    const password = String(row["Password"] || "").trim();

    if (!nama || !nis || !password) {
      results.gagal++;
      results.errors.push(`Baris ${i + 2}: Nama, NIS, dan Password wajib diisi`);
      continue;
    }

    try {
      await Siswa.create({
        kelasId,
        nama,
        nis,
        email: email || `${nama.split(" ")[0].toLowerCase()}@aetheris.edu`,
        gender: normalizeGender(genderRaw),
        password,
      });
      results.berhasil++;
    } catch (err: any) {
      results.gagal++;
      if (err.code === 11000) {
        results.errors.push(`Baris ${i + 2}: NIS "${nis}" sudah terdaftar`);
      } else {
        results.errors.push(`Baris ${i + 2}: Gagal menyimpan data`);
      }
    }
  }

  return NextResponse.json(results);
}