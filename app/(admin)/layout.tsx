import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveShell bg="bg-[#080b12]" sidebar={<Sidebar />} topbar={<Topbar />}>
      {children}
    </ResponsiveShell>
  );
}