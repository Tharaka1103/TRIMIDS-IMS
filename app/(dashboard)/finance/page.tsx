"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, FileText, ArrowRight, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
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

export default function FinanceDashboardPage() {
  const [finances, setFinances] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/finances").then(res => res.ok ? res.json() : []).then(data => Array.isArray(data) ? data : []).catch(() => []),
      fetch("/api/payroll").then(res => res.ok ? res.json() : []).then(data => Array.isArray(data) ? data : []).catch(() => [])
    ]).then(([financesData, payrollData]) => {
      setFinances(financesData || []);
      setPayrolls(payrollData || []);
      setLoading(false);
    });
  }, []);

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

  const totalPayrollPaid = payrolls
    .filter((p: any) => p.status === "Paid")
    .reduce((acc: number, curr: any) => acc + (curr.netPay || 0), 0);

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Command Center</h2>
          <p className="text-muted-foreground">High-level financial overview, income, expenses, and analytics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/payroll">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Manage Payroll</Button>
          </Link>
          <Link href="/finance/finances">
            <Button><PieChart className="mr-2 h-4 w-4" /> Manage Finances</Button>
          </Link>
        </div>
      </div>

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
             <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>     
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending</CardTitle>  
             <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-amber-600">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>    
             <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}