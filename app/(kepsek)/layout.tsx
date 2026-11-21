import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import KepsekSidebar from "@/components/kepsek/Sidebar";

export default async function KepsekLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "kepsek") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-white">
      <KepsekSidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}