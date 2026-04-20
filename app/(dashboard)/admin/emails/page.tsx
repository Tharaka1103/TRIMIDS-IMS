"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Search, Mail, Users, Send, FileText, Clock, CheckCircle, XCircle, Eye, Plus, Trash2, Download } from "lucide-react";

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
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  htmlContent: z.string().min(1, "Email content is required"),
  textContent: z.string().optional(),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to TRIMIDS IMS",
    category: "Onboarding",
    content: `
      <h2>Welcome to TRIMIDS IMS!</h2>
      <p>Dear {{name}},</p>
      <p>We are excited to have you join our team at TRIMIDS (Pvt) Ltd.</p>
      <p>Your account has been successfully created. You can now log in to the IMS system using your credentials.</p>
      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
      <p>Best regards,<br>TRIMIDS Team</p>
    `,
  },
  {
    id: "reminder",
    name: "Task Reminder",
    subject: "Task Reminder - Pending Tasks",
    category: "Tasks",
    content: `
      <h2>Task Reminder</h2>
      <p>Dear {{name}},</p>
      <p>This is a friendly reminder that you have pending tasks that need your attention.</p>
      <p>Please log in to your dashboard to view and complete your tasks before the deadline.</p>
      <p>Thank you for your cooperation.</p>
    `,
  },
  {
    id: "announcement",
    name: "Company Announcement",
    subject: "Important Company Announcement",
    category: "General",
    content: `
      <h2>Important Announcement</h2>
      <p>Dear Team,</p>
      <p>{{content}}</p>
      <p>Please ensure you read this announcement carefully.</p>
      <p>Best regards,<br>TRIMIDS Management</p>
    `,
  },
  {
    id: "meeting",
    name: "Meeting Invitation",
    subject: "Meeting Invitation - {{meetingTitle}}",
    category: "Meetings",
    content: `
      <h2>Meeting Invitation</h2>
      <p>Dear {{name}},</p>
      <p>You are invited to attend a meeting:</p>
      <p><strong>Title:</strong> {{meetingTitle}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p><strong>Time:</strong> {{time}}</p>
      <p><strong>Location:</strong> {{location}}</p>
      <p>Please confirm your attendance.</p>
    `,
  },
];

export default function AdminEmailsPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [previewEmail, setPreviewEmail] = useState<User | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");
  const [templatePreview, setTemplatePreview] = useState<EmailTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      htmlContent: "",
      textContent: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        const usersArray = Array.isArray(data.users) ? data.users : [];
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = Array.isArray(users) ? users : [];

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role.toLowerCase() === roleFilter.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    const allIds = filteredUsers.map((u) => u._id);
    setSelectedUsers(allIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("subject", template.subject);
      form.setValue("htmlContent", template.content);
      setSelectedTemplate(templateId);
      setActiveTab("compose");
    }
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setTemplatePreview(template);
    setShowTemplatePreview(true);
  };

  const handlePreview = () => {
    if (selectedUsers.length > 0) {
      setPreviewEmail(users.find((u) => u._id === selectedUsers[0]) || null);
      setShowPreview(true);
    } else {
      toast.error("Please select at least one recipient");
    }
  };

  const onSubmit = async (data: EmailFormValues) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: selectedUsers,
          subject: data.subject,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          templateId: selectedTemplate,
        }),
      });

      if (res.ok) {
        toast.success(`Email sent to ${selectedUsers.length} recipient(s)`);
        form.reset();
        setSelectedUsers([]);
        setSelectedTemplate("");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      hr: "bg-blue-500",
      finance: "bg-green-500",
      employee: "bg-purple-500",
      intern: "bg-orange-500",
    };
    return colors[role] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">Send emails to users in the system</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="history">Email History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Selection Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Recipients
                </CardTitle>
                <CardDescription>
                  Choose users to send the email to ({selectedUsers.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                    Select All ({filteredUsers.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </div>

                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            {searchTerm || roleFilter !== "all"
                              ? "No users found matching your search criteria"
                              : "No users available in the system"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-4 h-4"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Email Composition Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Compose Email
                </CardTitle>
                <CardDescription>Create and send your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Email Template</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Email</SelectItem>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      {...form.register("subject")}
                      placeholder="Email subject..."
                    />
                    {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">Email Content (HTML)</Label>
                <Textarea
                  id="htmlContent"
                  {...form.register("htmlContent")}
                  placeholder="Write your email content here (HTML supported)..."
                  className="min-h-[200px]"
                />
                {form.formState.errors.htmlContent && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.htmlContent.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="textContent">Plain Text Version (Optional)</Label>
                <Textarea
                  id="textContent"
                  {...form.register("textContent")}
                  placeholder="Plain text version of your email..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={sending || selectedUsers.length === 0} className="flex-1">
                  {sending && <Spinner className="mr-2 h-4 w-4" />}
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={selectedUsers.length === 0}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="templates" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Pre-defined email templates for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.category}</CardDescription>
                    </div>
                    <Badge variant="outline">{template.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleViewTemplate(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="history" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>View recent email sent from the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Email history feature coming soon</p>
            <p className="text-sm">This will show a log of all emails sent through the system</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  {/* Email Preview Dialog */}
  <Dialog open={showPreview} onOpenChange={setShowPreview}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Email Preview</DialogTitle>
        <DialogDescription>
          Preview how your email will appear to recipients
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>To: {previewEmail?.email}</Label>
          <Label>Subject: {form.watch("subject")}</Label>
        </div>
        <Separator />
        <div
          className="border rounded-lg p-4 min-h-[300px] prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: form.watch("htmlContent") }}
        />
      </div>
    </DialogContent>
  </Dialog>

  {/* Template Preview Dialog */}
  <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{templatePreview?.name}</DialogTitle>
        <DialogDescription>
          Template preview - {templatePreview?.category}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Subject: {templatePreview?.subject}</Label>
        </div>
        <Separator />
        <div
          className="border rounded-lg p-4 min-h-[300px] prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: templatePreview?.content || "" }}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
            Close
          </Button>
          <Button onClick={() => {
            if (templatePreview) {
              handleTemplateChange(templatePreview.id);
              setShowTemplatePreview(false);
            }
          }}>
            Use This Template
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</div>
  );
}
