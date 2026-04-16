import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmployeeDashboardPage from "@/app/(dashboard)/employee/page";

export default async function AdminViewEmployeePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <EmployeeDashboardPage />;
}
