import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nama: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seed() {
  console.log("Menghubungkan ke MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Terkoneksi ke MongoDB!");

  const existing = await Admin.findOne({ username: "admin" });
  if (existing) {
    console.log("Akun admin dengan username 'admin' sudah ada, seed dibatalkan.");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    username: "admin",
    password: hashedPassword,
    nama: "Administrator",
  });

  console.log("✅ Akun admin berhasil dibuat!");
  console.log("   Username: admin");
  console.log("   Password: admin123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Gagal seed:", err);
  process.exit(1);
});