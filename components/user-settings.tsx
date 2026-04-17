"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().optional(),
  language: z.string(),
  emailNotifications: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  color: z.enum(["zinc", "slate", "stone", "gray", "neutral", "red", "rose", "orange", "green", "blue", "yellow", "violet"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UserSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setTheme, theme, themeColor, setThemeColor } = useTheme();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      mobile: "",
      language: "en",
      emailNotifications: true,
      theme: "system",
      color: "zinc",
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/users/profile");
        const data = await res.json();
        if (res.ok) {
          form.reset({
            name: data.user.name || "",
            mobile: data.user.mobile || "",
            language: data.user.preferences?.language || "en",
            emailNotifications: data.user.preferences?.emailNotifications ?? true,
            theme: data.user.preferences?.theme || "system",
            color: data.user.preferences?.color || "zinc",
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [form]);

  // Sync active local states when the form values for theme/color change using watch
  const currentTheme = form.watch("theme");
  const currentColor = form.watch("color");

  useEffect(() => {
    if (!loading) {
      if (currentTheme !== theme) setTheme(currentTheme);
      if (currentColor !== themeColor) setThemeColor(currentColor as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme, currentColor, loading]);


  async function onSubmit(data: ProfileFormValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          mobile: data.mobile,
          preferences: {
            theme: data.theme,
            color: data.color,
            language: data.language,
            emailNotifications: data.emailNotifications,
          },
        }),
      });

      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
        <CardDescription>
          Manage your account profile and system preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" {...form.register("mobile")} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance & Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <Select
                  value={form.watch("theme")}
                  onValueChange={(val) => form.setValue("theme", val as any, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary System Color</Label>
                <Select
                  value={form.watch("color")}
                  onValueChange={(val) => form.setValue("color", val as any, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary color variable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zinc">Zinc (Default)</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your account via email.
                </p>
              </div>
              <Switch
                checked={form.watch("emailNotifications")}
                onCheckedChange={(val) => form.setValue("emailNotifications", val, { shouldDirty: true })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving || !form.formState.isDirty}>
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}