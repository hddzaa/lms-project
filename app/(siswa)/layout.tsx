import Sidebar from "@/components/siswa/Sidebar";
import Topbar from "@/components/admin/Topbar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveShell sidebar={<Sidebar />} topbar={<Topbar />}>
      {children}
    </ResponsiveShell>
  );
}