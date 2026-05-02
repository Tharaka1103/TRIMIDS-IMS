"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function FinancePayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user: "",
    month: "January",
    year: new Date().getFullYear(),
    baseSalary: 4500,
    bonuses: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchPayrolls();
    fetchUsers();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await fetch("/api/payroll");
      if (res.ok) setPayrolls(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const allUsers = await res.json();
      setUsers(allUsers.filter((u: any) => u.isActive));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user || !formData.month || !formData.year || formData.baseSalary < 0) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success("Payroll record created!");
      setIsDialogOpen(false);
      fetchPayrolls();
      setFormData({
        user: "",
        month: "January",
        year: new Date().getFullYear(),
        baseSalary: 4500,
        bonuses: 0,
        deductions: 0
      });
    } else {
      toast.error("Failed to create payroll.");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch("/api/payroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      toast.success(`Payroll marked as ${newStatus}`);
      fetchPayrolls();
    } else {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="flex-1 space-y-4 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-muted-foreground">Manage and disburse employee salaries and bonuses.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Issue Payroll</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New Payroll</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  required
                >
                  <option value="" disabled>Select employee...</option>
                  {users.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.roles?.join(', ')})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  >
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Base Salary</Label>
                  <Input type="number" step="0.01" required value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Bonuses</Label>
                  <Input type="number" step="0.01" value={formData.bonuses} onChange={(e) => setFormData({ ...formData, bonuses: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <Input type="number" step="0.01" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })} />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit">Draft Payroll</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Modifiers</TableHead>
                <TableHead className="text-blue-600">Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : payrolls.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No payroll records found.</TableCell></TableRow>
              ) : (
                payrolls.map((pay: any) => (
                  <TableRow key={pay._id}>
                    <TableCell className="font-medium text-sm">{pay.user?.name}</TableCell>
                    <TableCell className="text-sm">{pay.month} {pay.year}</TableCell>
                    <TableCell className="text-sm">${pay.baseSalary?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {pay.bonuses > 0 && <span className="text-green-600 block">+{pay.bonuses.toLocaleString()}</span>}
                      {pay.deductions > 0 && <span className="text-red-600 block">-{pay.deductions.toLocaleString()}</span>}
                      {pay.bonuses === 0 && pay.deductions === 0 && "--"}
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">${pay.netPay?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Badge variant={pay.status === "Approved" ? "default" : pay.status === "Paid" ? "secondary" : "outline"}>
                        {pay.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {pay.status === "Draft" ? (
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(pay._id, "Approved")}>Approve</Button>
                      ) : pay.status === "Approved" ? (
                        <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(pay._id, "Paid")}>Mark Paid</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}