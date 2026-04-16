"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Travel");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses?mine=true");
    if (res.ok) setExpenses(await res.json());
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, category, amount: Number(amount) }),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setDescription("");
        setCategory("Travel");
        setAmount("");
        fetchExpenses();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Expenses</h2>
          <p className="text-muted-foreground">Submit corporate expense claims for reimbursement.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Submit Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Expense Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Flight to NY for Conference" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="Travel">Travel & Transit</option>
                    <option value="Operations">Operations</option>
                    <option value="Software">Software & Subscriptions</option>
                    <option value="Hardware">Hardware & Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="125.50" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Submit Claim</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No expenses submitted.</TableCell></TableRow>
              ) : (
                expenses.map((expense: any) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(expense.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={expense.status === "Approved" || expense.status === "Paid" ? "default" : expense.status === "Rejected" ? "destructive" : "secondary"}>
                        {expense.status}
                      </Badge>
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
