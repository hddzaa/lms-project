import mongoose from "mongoose";
import bcrypt from "bcrypt";

try { process.loadEnvFile(".env.local"); } catch {}

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI tidak ditemukan di .env.local"); process.exit(1); }

const Admin = mongoose.models.Admin || mongoose.model(
  "Admin",
  new mongoose.Schema(
    {
      nama: String,
      username: { type: String, unique: true },
      password: String,
      role: { type: String, default: "admin" },
    },
    { timestamps: true }
  )
);

const akun = [
  { nama: "Kepala Sekolah", username: "kepsek", password: "kepsek123", role: "kepsek" },
  { nama: "Kurikulum", username: "kurikulum", password: "kurikulum123", role: "kurikulum" },
];

await mongoose.connect(uri);
for (const a of akun) {
  const hash = await bcrypt.hash(a.password, 10);
  await Admin.updateOne({ username: a.username }, { $set: { ...a, password: hash } }, { upsert: true });
  console.log(`OK: ${a.role} -> ${a.username} / ${a.password}`);
}
await mongoose.disconnect();