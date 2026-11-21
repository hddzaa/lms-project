import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { kelasYangBolehDiakses } from "@/lib/aksesGuru";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { guru, kelas } = await kelasYangBolehDiakses(session.user.id);
  if (!guru) return NextResponse.json([]);

  return NextResponse.json(
    kelas.map((k: any) => ({
      kelasId: k._id.toString(),
      grade: k.grade,
      name: k.name,
      kelasLabel: `${k.grade} ${k.name}`,
      mapel: guru.mapel,
    }))
  );
}