import { UserSettings } from "@/components/user-settings";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and profile.</p>
      </div>
      <UserSettings />
    </div>
  );
}
