"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Sun, Moon, Monitor, Eye, KeyRound } from "lucide-react";

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    companyName: "TRIMIDS Solutions",
    supportEmail: "support@trimids.com",
    requireMfa: true,
    sessionTimeout: "30",
    emailAlerts: true,
    pushAlerts: false,
    slackWebhooks: "https://hooks.slack.com/services/...",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async (section: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    toast.success(`${section} settings saved successfully.`);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* APPEARANCE */}
      <section id="appearance" className="scroll-mt-20">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">General & Appearance</CardTitle>
            <CardDescription>
              Customize your company info and dashboard look.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  value={settings.companyName} 
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email" 
                  value={settings.supportEmail} 
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} 
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2"><Eye className="w-4 h-4"/> Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light, dark, or system preference. The ThemeProvider works globally.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="w-24"
                >
                  <Sun className="w-4 h-4 mr-2" /> Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="w-24"
                >
                  <Moon className="w-4 h-4 mr-2" /> Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="w-24"
                >
                  <Monitor className="w-4 h-4 mr-2" /> System
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t px-6 py-4">
             <Button onClick={() => handleSave("General")}>
              {loading ? "Saving..." : "Save General Settings"}
             </Button>
          </CardFooter>
        </Card>
      </section>

      {/* NOTIFICATIONS */}
      <section id="notifications" className="scroll-mt-20">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to be alerted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive daily system metrics and error logs via email.</p>
              </div>
              <Switch 
                checked={settings.emailAlerts} 
                onCheckedChange={(c) => setSettings({ ...settings, emailAlerts: c })} 
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive immediate browser alerts for high-priority tasks.</p>
              </div>
              <Switch 
                checked={settings.pushAlerts} 
                onCheckedChange={(c) => setSettings({ ...settings, pushAlerts: c })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slackWebhooks">Slack Webhook URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="slackWebhooks" 
                  value={settings.slackWebhooks} 
                  onChange={(e) => setSettings({ ...settings, slackWebhooks: e.target.value })} 
                />
                <Button variant="secondary" size="icon"><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Used to dispatch automated security and error logs to your ops channel.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t px-6 py-4">
             <Button onClick={() => handleSave("Notifications")}>
              {loading ? "Saving..." : "Save Notification Settings"}
             </Button>
          </CardFooter>
        </Card>
      </section>

      {/* SECURITY */}
      <section id="security" className="scroll-mt-20">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Security & Sessions</CardTitle>
            <CardDescription>
              Manage global compliance policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold flex items-center gap-2"><KeyRound className="w-4 h-4" /> Require MFA for Everyone</Label>
                <p className="text-sm text-muted-foreground">Enforces Time-based One-Time Password (TOTP).</p>
              </div>
              <Switch 
                checked={settings.requireMfa} 
                onCheckedChange={(c) => setSettings({ ...settings, requireMfa: c })} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Idle Session Timeout (Minutes)</Label>
              <Input 
                id="sessionTimeout" 
                type="number" 
                min="5" 
                max="1440"
                value={settings.sessionTimeout} 
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })} 
                className="w-1/3"
              />
              <p className="text-xs text-muted-foreground">Users will be automatically logged out after this idle period.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 border-t px-6 py-4 justify-between">
             <Button variant="destructive" onClick={() => toast.success("All active sessions terminated.")}>Terminate All Sessions</Button>
             <Button onClick={() => handleSave("Security")}>
              {loading ? "Saving..." : "Save Security Settings"}
             </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
