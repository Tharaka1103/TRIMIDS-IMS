import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceDashboardPage from "@/app/(dashboard)/finance/page";

export default async function AdminViewFinancePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <FinanceDashboardPage />;
}
