"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function FinanceExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) setExpenses(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
    const res = await fetch("/api/expenses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(`Expense request marked as ${status}`);
      fetchExpenses();
    } else {
      toast.error("Failed to update status");
    }
  };

  const filteredExpenses = expenses.filter((e: any) => {
    const matchesSearch = e.description?.toLowerCase().includes(search.toLowerCase()) ||
                          e.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
        <p className="text-muted-foreground">Review, approve, and process employee expense claims.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Claims Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No expense claims match your search.</TableCell></TableRow>
              ) : (
                filteredExpenses.map((expense: any) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium text-xs">{expense.user?.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(expense.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-sm">{expense.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{expense.category}</TableCell>
                    <TableCell className="font-medium text-blue-600">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        expense.status === "Approved" ? "default" :
                        expense.status === "Paid" ? "secondary" :
                        expense.status === "Rejected" ? "destructive" : "outline"
                      }>
                        {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {expense.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleAction(expense._id, "Approved")}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleAction(expense._id, "Rejected")}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : expense.status === "Approved" ? (
                        <Button variant="outline" size="sm" className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800" onClick={() => handleAction(expense._id, "Paid")}>
                          Mark Paid
                        </Button>
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