import { Schema, models, model } from "mongoose";
import bcrypt from "bcrypt";

const GuruSchema = new Schema(
  {
    nama: { type: String, required: true },
    nip: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    mapel: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

GuruSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const Guru = models.Guru || model("Guru", GuruSchema);
export default Guru;