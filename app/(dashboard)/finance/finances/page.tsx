"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Eye, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const INCOME_CATEGORIES = [
  "Software Licenses",
  "Consulting Services",
  "Maintenance & Support",
  "Custom Development",
  "Training",
  "Subscription Revenue",
  "SaaS Revenue",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Salaries & Wages",
  "Software Subscriptions",
  "Cloud Services",
  "Office Rent",
  "Utilities",
  "Marketing & Advertising",
  "Travel & Expenses",
  "Equipment & Hardware",
  "Software Development Tools",
  "Insurance",
  "Legal & Professional Services",
  "Training & Development",
  "Office Supplies",
  "Other Expenses",
];

export default function FinancePage() {
  const [finances, setFinances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("view"); // "view" or "edit"
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: "expense",
    description: "",
    category: "",
    amount: "",
    status: "Pending",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const res = await fetch("/api/finances");
      if (res.ok) {
        const data = await res.json();
        setFinances(Array.isArray(data) ? data : []);
      } else {
        setFinances([]);
      }
    } catch (error) {
      console.error("Error fetching finances:", error);
      setFinances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
        }),
      });
      if (res.ok) {
        toast.success("Finance record created successfully");
        setIsAddOpen(false);
        resetForm();
        fetchFinances();
      } else {
        toast.error("Failed to create finance record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFinance) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/finances/${selectedFinance._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
        }),
      });
      if (res.ok) {
        toast.success("Finance record updated successfully");
        setIsEditOpen(false);
        resetForm();
        fetchFinances();
      } else {
        toast.error("Failed to update finance record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFinance) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/finances/${selectedFinance._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Finance record deleted successfully");
        setIsDeleteOpen(false);
        setSelectedFinance(null);
        fetchFinances();
      } else {
        toast.error("Failed to delete finance record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "expense",
      description: "",
      category: "",
      amount: "",
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedFinance(null);
  };

  const openEditDialog = (finance: any) => {
    setSelectedFinance(finance);
    setFormData({
      type: finance.type,
      description: finance.description,
      category: finance.category,
      amount: finance.amount.toString(),
      status: finance.status,
      date: new Date(finance.date).toISOString().split('T')[0],
    });
    setIsEditOpen(true);
  };

  const filteredFinances = finances.filter((f: any) => {
    const matchesSearch = f.description?.toLowerCase().includes(search.toLowerCase()) ||
                          f.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || f.type === typeFilter;
    const matchesStatus = statusFilter === "All" || f.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalIncome = finances
    .filter((f: any) => f.type === "income" && (f.status === "Approved" || f.status === "Paid"))
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const totalExpenses = finances
    .filter((f: any) => f.type === "expense" && (f.status === "Approved" || f.status === "Paid"))
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const pendingAmount = finances
    .filter((f: any) => f.status === "Pending")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0);

  // Prepare chart data
  const monthlyData = finances.reduce((acc: any, f: any) => {
    const month = format(new Date(f.date), 'MMM');
    if (!acc[month]) {
      acc[month] = { name: month, income: 0, expense: 0 };
    }
    if (f.status === "Approved" || f.status === "Paid") {
      acc[month][f.type] += f.amount;
    }
    return acc;
  }, {});

  const chartData = Object.values(monthlyData);

  const categoryData = finances
    .filter((f: any) => f.status === "Approved" || f.status === "Paid")
    .reduce((acc: any, f: any) => {
      const key = f.category;
      if (!acc[key]) acc[key] = 0;
      acc[key] += f.amount;
      return acc;
    }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Prepare radar chart data for income categories
  const incomeCategoryData = INCOME_CATEGORIES.map(category => {
    const amount = finances
      .filter((f: any) => f.type === "income" && f.category === category && (f.status === "Approved" || f.status === "Paid"))
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    return { category, amount };
  });

  // Prepare radar chart data for expense categories
  const expenseCategoryData = EXPENSE_CATEGORIES.map(category => {
    const amount = finances
      .filter((f: any) => f.type === "expense" && f.category === category && (f.status === "Approved" || f.status === "Paid"))
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    return { category, amount };
  });

  // Prepare line chart data for trend analysis
  const trendData = finances
    .filter((f: any) => f.status === "Approved" || f.status === "Paid")
    .reduce((acc: any, f: any) => {
      const date = format(new Date(f.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0, balance: 0 };
      }
      if (f.type === "income") {
        acc[date].income += f.amount;
      } else {
        acc[date].expense += f.amount;
      }
      acc[date].balance = acc[date].income - acc[date].expense;
      return acc;
    }, {});

  const trendChartData = Object.values(trendData).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (viewMode === "view") {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Finance Overview</h2>
            <p className="text-muted-foreground">Overall financial statistics and analytics</p>
          </div>
          <Button onClick={() => setViewMode("edit")}>
            <Edit2 className="mr-2 h-4 w-4" /> Switch to Edit Mode
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved & Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved & Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <PieChart className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Financial Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Expense" />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Balance" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Income by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={incomeCategoryData}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10 }} />
                    <Radar name="Income" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.6} strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={expenseCategoryData}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 'auto']} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10 }} />
                    <Radar name="Expenses" dataKey="amount" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Spinner className="mx-auto" /></TableCell></TableRow>
                ) : finances.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
                ) : (
                  finances.slice(0, 10).map((finance: any) => (
                    <TableRow key={finance._id}>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(finance.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={finance.type === 'income' ? 'default' : 'destructive'}>
                          {finance.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{finance.description}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{finance.category}</TableCell>
                      <TableCell className={`font-medium ${finance.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ${finance.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          finance.status === "Approved" ? "default" :
                          finance.status === "Paid" ? "secondary" :
                          finance.status === "Rejected" ? "destructive" : "outline"
                        }>
                          {finance.status}
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

  // Edit Mode
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Management</h2>
          <p className="text-muted-foreground">Create, update, and manage finance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode("view")}>
            <Eye className="mr-2 h-4 w-4" /> View Mode
          </Button>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
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
              ) : filteredFinances.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No finance records match your search.</TableCell></TableRow>
              ) : (
                filteredFinances.map((finance: any) => (
                  <TableRow key={finance._id}>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(finance.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={finance.type === 'income' ? 'default' : 'destructive'}>
                        {finance.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{finance.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{finance.category}</TableCell>
                    <TableCell className={`font-medium ${finance.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      ${finance.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        finance.status === "Approved" ? "default" :
                        finance.status === "Paid" ? "secondary" :
                        finance.status === "Rejected" ? "destructive" : "outline"
                      }>
                        {finance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(finance)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => { setSelectedFinance(finance); setIsDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit Finance Record" : "Add Finance Record"}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? "Update the finance record details." : "Create a new income or expense record."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {formData.type === "income" ? (
                    INCOME_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  ) : (
                    EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={isEditOpen ? handleUpdate : handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this finance record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
