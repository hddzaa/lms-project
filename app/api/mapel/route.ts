import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MataPelajaran from "@/models/MataPelajaran";
import Guru from "@/models/Guru";

export async function GET() {
  await connectDB();
  const [mapelList, guruList] = await Promise.all([
    MataPelajaran.find().sort({ createdAt: 1 }).lean(),
    Guru.find().select("nama mapel").lean(),
  ]);

  return NextResponse.json(
    mapelList.map((m: any) => {
      const pengampu = guruList
        .filter((g: any) => g.mapel?.trim().toLowerCase() === m.nama?.trim().toLowerCase())
        .map((g: any) => g.nama);

      return {
        ...m,
        id: m._id.toString(),
        guruPengampu: pengampu.length > 0 ? pengampu.join(", ") : "Belum ditentukan",
      };
    })
  );
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const mapel = await MataPelajaran.create(body);
  return NextResponse.json({ ...mapel.toObject(), id: mapel._id.toString() });
}