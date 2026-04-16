import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import InternDashboardPage from "@/app/(dashboard)/intern/page";

export default async function AdminViewInternPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <InternDashboardPage />;
}
