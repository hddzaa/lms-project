import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authOptions } from "@/lib/authOptions";
import { s3, S3_BUCKET } from "@/lib/s3";

export async function GET(req: Request, context: { params: Promise<{ key: string[] }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Harus login" }, { status: 401 });

  const { key } = await context.params;
  const objectKey = key.map(decodeURIComponent).join("/");

  if (!/^(materi|tugas)\/[^/]+$/.test(objectKey) || objectKey.includes("..")) {
    return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
  }

  // mode lokal
  if (!s3) {
    return NextResponse.redirect(new URL(`/uploads/${objectKey}`, req.url));
  }

  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }), {
    expiresIn: 3600,
  });
  return NextResponse.redirect(url);
}