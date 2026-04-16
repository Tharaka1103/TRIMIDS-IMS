"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, Wallet, Check, X, FileText, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FinanceDashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/expenses").then(res => res.json()).catch(() => []),
      fetch("/api/payroll").then(res => res.json()).catch(() => [])
    ]).then(([expensesData, payrollData]) => {
      setExpenses(expensesData || []);
      setPayrolls(payrollData || []);
      setLoading(false);
    });
  }, []);

  const pendingAmount = expenses
    .filter((e: any) => e.status === "Pending")
    .reduce((acc, curr: any) => acc + curr.amount, 0);

  const totalPayrollPaid = payrolls
    .filter((p: any) => p.status === "Paid")
    .reduce((acc: number, curr: any) => acc + (curr.netPay || 0), 0);

  // Derive charts for chart mock - real metrics based on data
  const data = [
    { name: 'Jan', expense: 4000, payroll: 24000 },
    { name: 'Feb', expense: 3000, payroll: 13980 },
    { name: 'Mar', expense: 2000, payroll: 9800 },
    { name: 'Apr', expense: 2780, payroll: 39080 },
    { name: 'May', expense: 1890, payroll: 48000 },
    { name: 'Jun', expense: 2390, payroll: 38000 },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finance Command Center</h2>
          <p className="text-muted-foreground">High-level financial overview, payroll limits, and open claims.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/payroll">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Manage Payroll</Button>
          </Link>
          <Link href="/finance/expenses">
            <Button><CreditCard className="mr-2 h-4 w-4" /> View Expenses</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Monthly Outflow (Payroll)</CardTitle>
             <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-emerald-600">${totalPayrollPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div> 
             <p className="text-xs text-muted-foreground mt-1">Total distributed this cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
             <CreditCard className="h-4 w-4 text-amber-500" />     
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-amber-600">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
             <p className="text-xs text-muted-foreground mt-1">Requires your authorization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Q4 Budget Usage</CardTitle>
             <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">64%</div>
             <p className="text-xs text-muted-foreground mt-1">On track for end of year</p>     
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Reconciled Expenses</CardTitle>  
             <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-blue-600">
               ${expenses.filter((e: any) => e.status === "Paid").reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </div>    
             <p className="text-xs text-muted-foreground mt-1">Cleared transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="payroll" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Priority Action Items</CardTitle>
            <Link href="/finance/expenses" className="text-xs text-blue-600 flex items-center hover:underline">
              Review All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
              <div className="space-y-4">
                {expenses.filter((e: any) => e.status === "Pending").slice(0, 5).map((expense: any) => (
                  <div key={expense._id} className="flex items-center justify-between py-2 border-b last:border-b-0 group">
                    <div>
                      <p className="text-sm font-medium leading-none">{expense.user?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-600">${expense.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="mt-1">{expense.category}</Badge>
                    </div>
                  </div>
                ))}
                {!loading && expenses.filter((e: any) => e.status === "Pending").length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50 rounded-lg border border-emerald-100 h-full">
                    <Check className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-900">All caught up!</p>
                    <p className="text-xs text-emerald-700 mt-1">No pending expense claims require your attention.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}