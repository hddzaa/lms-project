import { Schema, models, model } from "mongoose";

const AdminSchema = new Schema(
  {
    nama: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "kepsek", "kurikulum"], default: "admin" },
  },
  { timestamps: true }
);

const Admin = models.Admin || model("Admin", AdminSchema);
export default Admin;