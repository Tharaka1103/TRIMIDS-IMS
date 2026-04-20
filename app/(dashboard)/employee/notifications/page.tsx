import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotificationsInbox } from "@/app/components/shared/notifications-inbox";

export default async function EmployeeNotificationsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Notifications</h2>
          <p className="text-muted-foreground">
            View your system alerts, task assignments, and internal broadcasts.
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
         <NotificationsInbox userId={session.userId} />
      </div>
    </div>
  );
}
