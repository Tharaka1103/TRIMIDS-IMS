"use client";

import { SettingsForm } from "@/components/forms/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <nav className="hidden md:flex flex-col gap-2">
          <a href="#appearance" className="text-sm font-medium hover:bg-muted p-2 rounded-md transition-colors bg-muted">General & Appearance</a>
          <a href="#notifications" className="text-sm font-medium hover:bg-muted p-2 rounded-md transition-colors text-muted-foreground">Notifications</a>
          <a href="#security" className="text-sm font-medium hover:bg-muted p-2 rounded-md transition-colors text-muted-foreground">Security</a>
        </nav>
        <div className="space-y-6">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
