"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Search, UserCheck, UserX, Trash2, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Intern = {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  department?: string;
  mobile?: string;
  createdAt: string;
};

const internFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  department: z.string().optional(),
  mobile: z.string().optional(),
});

type InternFormValues = z.infer<typeof internFormSchema>;

export default function AdminInternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<InternFormValues>({
    resolver: zodResolver(internFormSchema)
  });

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interns");
      if (res.ok) {
        const data = await res.json();
        setInterns(data);
      }
    } catch (error) {
      console.error("Failed to fetch interns", error);
      toast.error("Failed to load interns");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/interns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
         fetchInterns();
         toast.success(`Intern ${isActive ? 'activated' : 'suspended'}`);
      } else {
         toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error occurred");
    }
  };

  const onAddSubmit = async (data: InternFormValues) => {
    if (!data.password) {
      toast.error("Password is required for new intern");
      return;
    }
    
    try {
      const res = await fetch("/api/interns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success("Intern added successfully");
        setAddOpen(false);
        reset();
        fetchInterns();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add intern");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const onEditSubmit = async (data: InternFormValues) => {
    if (!selectedIntern) return;
    try {
      const res = await fetch(`/api/interns/${selectedIntern._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success("Intern updated successfully");
        setEditOpen(false);
        fetchInterns();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update intern");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedIntern) return;
    try {
      const res = await fetch(`/api/interns/${selectedIntern._id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        toast.success("Intern deleted successfully");
        setDeleteOpen(false);
        fetchInterns();
      } else {
        toast.error("Failed to delete intern");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const openEdit = (intern: Intern) => {
    setSelectedIntern(intern);
    reset({
      name: intern.name,
      email: intern.email,
      department: intern.department || "",
      mobile: intern.mobile || "",
    });
    setEditOpen(true);
  };

  const filteredInterns = interns.filter(
    (intern) =>
      intern.name.toLowerCase().includes(search.toLowerCase()) ||
      intern.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intern Management</h2>
          <p className="text-muted-foreground">
            View and manage intern accounts across the organization.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { reset({}); setAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Intern
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Loading interns...
                  </TableCell>
                </TableRow>
              ) : filteredInterns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No interns found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInterns.map((intern) => (
                  <TableRow key={intern._id}>
                    <TableCell className="font-medium">{intern.name}</TableCell>  
                    <TableCell>{intern.email}</TableCell>
                    <TableCell>{intern.department || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(intern.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={intern.isActive ? "default" : "secondary"}
                        className={intern.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                      >
                        {intern.isActive ? "Active" : "Suspended"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => { setSelectedIntern(intern); setViewOpen(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> View details
                          </DropdownMenuItem>       
                          <DropdownMenuItem onClick={() => openEdit(intern)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit intern
                          </DropdownMenuItem>        
                          <DropdownMenuSeparator />
                          {intern.isActive ? (
                            <DropdownMenuItem className="text-amber-600" onClick={() => handleStatusChange(intern._id, false)}>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600" onClick={() => handleStatusChange(intern._id, true)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Restore access
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-100 focus:text-red-700" onClick={() => { setSelectedIntern(intern); setDeleteOpen(true); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Intern
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Intern</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="department">Department</Label>
                 <Input id="department" {...register("department")} placeholder="e.g. IT" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="mobile">Mobile Number</Label>
                 <Input id="mobile" {...register("mobile")} placeholder="+1 234 567 890" />
               </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Intern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Intern Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="edit-department">Department</Label>
                 <Input id="edit-department" {...register("department")} />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="edit-mobile">Mobile Number</Label>
                 <Input id="edit-mobile" {...register("mobile")} />
               </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Intern Details</DialogTitle>
          </DialogHeader>
          {selectedIntern && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Name</div>
                <div className="col-span-2 text-sm">{selectedIntern.name}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Email</div>
                <div className="col-span-2 text-sm">{selectedIntern.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Department</div>
                <div className="col-span-2 text-sm">{selectedIntern.department || "No department specified"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Mobile</div>
                <div className="col-span-2 text-sm">{selectedIntern.mobile || "No mobile specified"}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-b pb-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Status</div>
                <div className="col-span-2 text-sm">
                   <Badge variant={selectedIntern.isActive ? "default" : "secondary"} className={selectedIntern.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                     {selectedIntern.isActive ? "Active" : "Suspended"}
                   </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm font-medium text-muted-foreground">Joined At</div>
                <div className="col-span-2 text-sm">{format(new Date(selectedIntern.createdAt), "PPP p")}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> 
              Delete Intern
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">Are you sure you want to permanently delete <strong>{selectedIntern?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone. This will permanently delete the user account and remove their data from our servers.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
