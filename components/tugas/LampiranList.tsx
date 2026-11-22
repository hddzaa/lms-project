import { FileText, Download } from "lucide-react";

type Lampiran = { name: string; url: string; size?: number };

function ukuran(b?: number) {
  if (!b) return "";
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

export default function LampiranList({
  files,
  judul,
}: {
  files?: Lampiran[];
  judul?: string;
}) {
  if (!files || files.length === 0) return null;
  return (
    <div className="mt-4">
      {judul && <p className="mb-2 text-xs font-medium tracking-wide text-muted">{judul}</p>}
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.url}>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/5"
            >
              <FileText size={16} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted">{ukuran(f.size)}</span>
              <Download size={15} className="shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}