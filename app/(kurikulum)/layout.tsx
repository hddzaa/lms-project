import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import Sidebar from "@/components/kurikulum/Sidebar";
import ResponsiveShell from "@/components/ui/ResponsiveShell";

export default async function KurikulumLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "kurikulum") redirect("/login");

  return (
    <ResponsiveShell sidebar={<Sidebar />}>
      {children}
    </ResponsiveShell>
  );
}