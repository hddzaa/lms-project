import Sidebar from "@/components/guru/Sidebar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveShell sidebar={<Sidebar />}>
      {children}
    </ResponsiveShell>
  );
}