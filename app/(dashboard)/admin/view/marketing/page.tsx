import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MarketingDashboardPage from "@/app/(dashboard)/marketing/page";

export default async function AdminViewMarketingPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  return <MarketingDashboardPage />;
}
