import { Schema, models, model } from "mongoose";

const MataPelajaranSchema = new Schema(
  {
    nama: { type: String, required: true },
    guruPengampu: { type: String, default: "Belum ditentukan" },
  },
  { timestamps: true }
);

const MataPelajaran = models.MataPelajaran || model("MataPelajaran", MataPelajaranSchema);
export default MataPelajaran;