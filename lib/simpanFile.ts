import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET } from "@/lib/s3";

export async function simpanFile(file: File, folder: "materi" | "tugas") {
  const namaAman = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const namaFile = `${Date.now()}-${namaAman}`;
  const key = `${folder}/${namaFile}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: file.type || "application/octet-stream",
      })
    );
  } else {
    // mode lokal (tanpa env S3): simpan ke public/uploads
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, namaFile), bytes);
  }

  return { name: file.name, url: `/api/files/${key}`, type: file.type, size: file.size };
}