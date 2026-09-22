import { Schema, models, model } from "mongoose";
import bcrypt from "bcrypt";

const SiswaSchema = new Schema(
  {
    kelasId: { type: Schema.Types.ObjectId, ref: "Kelas", required: true },
    nama: { type: String, required: true },
    nis: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

SiswaSchema.pre("save", async function (next: any) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Siswa = models.Siswa || model("Siswa", SiswaSchema);
export default Siswa;