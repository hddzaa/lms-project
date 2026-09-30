import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/Assessment";

export async function PUT(req: Request, context: { params: Promise<{ id: string; soalId: string }> }) {
  const { id, soalId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const assessment: any = await Assessment.findById(id);
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assessment.guruId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const soal = assessment.soal.id(soalId);
  if (!soal) return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });

  Object.assign(soal, body);
  await assessment.save();

  return NextResponse.json({ soal: assessment.soal.map((s: any) => ({ ...s.toObject(), id: s._id.toString() })) });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string; soalId: string }> }) {
  const { id, soalId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const assessment: any = await Assessment.findById(id);
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (assessment.guruId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  assessment.soal.pull(soalId);
  await assessment.save();

  return NextResponse.json({ soal: assessment.soal.map((s: any) => ({ ...s.toObject(), id: s._id.toString() })) });
}