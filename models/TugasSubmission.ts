import { Schema, models, model } from "mongoose";

const FileSchema = new Schema(
  { name: String, url: String, size: Number },
  { _id: false }
);

const TugasSubmissionSchema = new Schema(
  {
    tugasId: { type: Schema.Types.ObjectId, ref: "Tugas", required: true },
    siswaId: { type: Schema.Types.ObjectId, ref: "Siswa", required: true },
    files: [FileSchema],
    catatan: { type: String, default: "" },
    status: { type: String, enum: ["dikumpulkan", "terlambat"], default: "dikumpulkan" },
    nilai: { type: Number, min: 0, max: 100, default: null },
    komentar: { type: String, default: "" },
    waktuKumpul: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TugasSubmissionSchema.index({ tugasId: 1, siswaId: 1 });

export default models.TugasSubmission || model("TugasSubmission", TugasSubmissionSchema);