import Sidebar from "@/components/siswa/Sidebar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveShell sidebar={<Sidebar />}>
      {children}
    </ResponsiveShell>
  );
}