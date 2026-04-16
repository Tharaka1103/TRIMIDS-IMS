import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import HRDashboardPage from "@/app/(dashboard)/hr/page";

export default async function AdminViewHRPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <HRDashboardPage />;
}
