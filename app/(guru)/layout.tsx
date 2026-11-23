import Sidebar from "@/components/guru/Sidebar";
import Topbar from "@/components/admin/Topbar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveShell sidebar={<Sidebar />} topbar={<Topbar />}>
      {children}
    </ResponsiveShell>
  );
}