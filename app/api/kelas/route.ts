import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Kelas from "@/models/Kelas";
import Siswa from "@/models/Siswa";

export async function GET() {
  await connectDB();
  const kelasList = await Kelas.find().sort({ createdAt: 1 }).lean();

  const withCount = await Promise.all(
    kelasList.map(async (k: any) => {
      const jumlahSiswa = await Siswa.countDocuments({ kelasId: k._id });
      return { ...k, id: k._id.toString(), jumlahSiswa };
    })
  );

  return NextResponse.json(withCount);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const kelas = await Kelas.create(body);
  return NextResponse.json({ ...kelas.toObject(), id: kelas._id.toString(), jumlahSiswa: 0 });
}