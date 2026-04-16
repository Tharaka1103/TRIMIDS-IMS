"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, MoreHorizontal, Settings, Trash, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/permissions";
import { ROLES, Role } from "@/types/permissions";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum([
    ROLES.ADMIN,
    ROLES.INTERN,
    ROLES.EMPLOYEE,
    ROLES.HR_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.MARKETING_MANAGER,
  ]),
  department: z.string().optional(),
  position: z.string().optional(),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UsersClientProps {
  initialUsers: any[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.EMPLOYEE,
      department: "",
      position: "",
      isActive: true,
    },
  });

  const handleOpenAdd = () => {
    form.reset({
      name: "",
      email: "",
      password: "",
      role: ROLES.EMPLOYEE,
      department: "",
      position: "",
      isActive: true,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: "", // Empty so admin can type to replace
      role: user.role as Role,
      department: user.department || "",
      position: user.position || "",
      isActive: user.isActive,
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (user: any) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const isEdit = !!selectedUser;
      const url = isEdit ? `/api/users/${selectedUser._id}` : `/api/users`;
      const method = isEdit ? "PUT" : "POST";

      const payload = { ...values };
      if (!payload.password || payload.password.trim() === "") {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(isEdit ? "User updated successfully" : "User created successfully", {
         description: isEdit ? "The user profile has been updated." : "A new user account was provisioned with the default password."
      });
      
      setIsAddOpen(false);
      setIsEditOpen(false);
      setSelectedUser(null);
      
      // We could update local state, or refresh page. Refresh is safer.
      router.refresh();
      
      // Update local state temporarily for immediate UI feedback
      if (isEdit) {
        setUsers(users.map((u) => (u._id === selectedUser._id ? { ...u, ...values } : u)));
      } else {
        setUsers([data.user, ...users]);
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted", {
         description: "The user has been permanently removed"
      });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      router.refresh();
      setUsers(users.filter((u) => u._id !== selectedUser._id));
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all staff and system accounts
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenAdd}>
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users.length} total active and inactive accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user._id.toString()}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {user.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(user.role as any)}
                    >
                      {getRoleDisplayName(user.role as any)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.department || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin
                      ? formatDistanceToNow(new Date(user.lastLogin), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenView(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Role & Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-700"
                          onClick={() => handleOpenDelete(user)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Form (Add / Edit) Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setSelectedUser(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? "Update the details of the user." : "Create a new user account here."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password {isEditOpen && <span className="text-muted-foreground text-xs font-normal">(Leave blank to keep current)</span>}</Label>
              <Input
                id="password"
                type="password"
                placeholder={isEditOpen ? "••••••••" : "Password@123"}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <Select 
                onValueChange={(val) => form.setValue("role", val as any)} 
                defaultValue={form.getValues("role")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.INTERN}>Intern</SelectItem>
                  <SelectItem value={ROLES.EMPLOYEE}>Employee</SelectItem>
                  <SelectItem value={ROLES.HR_MANAGER}>HR</SelectItem>
                  <SelectItem value={ROLES.FINANCE_MANAGER}>Finance</SelectItem>
                  <SelectItem value={ROLES.MARKETING_MANAGER}>Marketing</SelectItem>
                  <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Engineering"
                {...form.register("department")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="e.g. Senior Developer"
                {...form.register("position")}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="space-y-0.5">
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  Determine if this user can login.
                </p>
              </div>
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(val) => form.setValue("isActive", val)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash className="w-5 h-5"/>
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{selectedUser?.name}</span>? 
              This action cannot be undone and will erase all data associated with this user.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View User Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>View Profile</DialogTitle>
            <DialogDescription>Read-only view of the selected user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 pb-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base text-foreground font-medium">{selectedUser?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base text-foreground">{selectedUser?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <div className="mt-1">
                {selectedUser?.role && (
                   <Badge variant="outline" className={getRoleBadgeColor(selectedUser.role)}>
                     {getRoleDisplayName(selectedUser.role)}
                   </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-base text-foreground">{selectedUser?.department || "N/A"}</p>
               </div>
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p className="text-base text-foreground">{selectedUser?.position || "N/A"}</p>
               </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-base text-foreground">
                {selectedUser?.isActive ? (
                    <span className="text-green-500 font-medium">Active Account</span>
                ) : (
                    <span className="text-red-500 font-medium">Inactive Account</span>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
                setIsViewOpen(false);
                handleOpenEdit(selectedUser);
            }}>
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}