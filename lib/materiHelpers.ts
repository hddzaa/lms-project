import { FileText, Presentation, FileVideo, Archive, File as FileIcon } from "lucide-react";

export function getFileMeta(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return { icon: FileText, color: "bg-red-500/15 text-red-400" };
  if (["ppt", "pptx"].includes(ext)) return { icon: Presentation, color: "bg-orange-500/15 text-orange-400" };
  if (["doc", "docx"].includes(ext)) return { icon: FileText, color: "bg-blue-500/15 text-blue-400" };
  if (["mp4", "mov", "avi"].includes(ext)) return { icon: FileVideo, color: "bg-sky-500/15 text-sky-400" };
  if (["zip", "rar"].includes(ext)) return { icon: Archive, color: "bg-gray-500/15 text-gray-300" };
  return { icon: FileIcon, color: "bg-white/10 text-gray-300" };
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}