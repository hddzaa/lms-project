import { Schema, models, model } from "mongoose";

const AktivitasSiswaSchema = new Schema(
  {
    siswaId: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    jenis: {
      type: String,
      enum: ["Mengerjakan Assessment", "Melihat Materi", "Mengumpulkan Tugas", "Melihat Nilai"],
      required: true,
    },
    keterangan: { type: String, required: true },
  },
  { timestamps: true }
);

const AktivitasSiswa = models.AktivitasSiswa || model("AktivitasSiswa", AktivitasSiswaSchema);
export default AktivitasSiswa;