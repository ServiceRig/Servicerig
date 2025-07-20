
'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn, getInvoiceStatusStyles } from '@/lib/utils';
import type { Invoice } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Plus, MoreHorizontal, CreditCard, Download } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { unparse } from 'papaparse';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign, FileText, Percent, CheckCircle } from 'lucide-react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function InvoicingPageContent() {
    const { role } = useRole();
    const [invoices, setInvoices] = useState<Invoice[]>(() => {
        const enriched = mockData.invoices.map(inv => ({
            ...inv,
            customerName: mockData.customers.find(c => c.id === inv.customerId)?.primaryContact.name || 'Unknown Customer',
        }));
        return enriched.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                invoice.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    const summaryStats = useMemo(() => {
        const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const outstandingBalance = totalInvoiced - totalCollected;
        const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid' || inv.balanceDue <= 0);
        const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) : 0;
        
        return {
            totalInvoiced: formatCurrency(totalInvoiced),
            totalCollected: formatCurrency(totalCollected),
            outstandingBalance: formatCurrency(outstandingBalance),
            collectionRate: `${(collectionRate * 100).toFixed(0)}%`,
        }
    }, [filteredInvoices]);
    
    const handleExport = () => {
        const dataToExport = filteredInvoices.map(invoice => ({
            'Invoice #': invoice.invoiceNumber,
            'Customer': invoice.customerName,
            'Issue Date': format(new Date(invoice.issueDate), 'yyyy-MM-dd'),
            'Due Date': format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
            'Total': invoice.total,
            'Balance Due': invoice.balanceDue,
            'Status': invoice.status,
            'Job ID': invoice.jobId || 'N/A',
        }));

        const csv = unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        return `${path}?${roleParam}`;
    }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Invoicing Dashboard</h1>
                <p className="text-muted-foreground">Manage, send, and track all your customer invoices.</p>
            </div>
             <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="#">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Invoiced" value={summaryStats.totalInvoiced} change="in selected period" icon={FileText} />
            <StatCard title="Total Collected" value={summaryStats.totalCollected} change="in selected period" icon={DollarSign} />
            <StatCard title="Outstanding Balance" value={summaryStats.outstandingBalance} change="across all invoices" icon={CheckCircle} />
            <StatCard title="Collection Rate" value={summaryStats.collectionRate} change="Total Collected / Total Invoiced" icon={Percent} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>All Invoices</CardTitle>
                    <CardDescription>A detailed list of all invoices matching the current filters.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>
            <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
                <Input 
                    placeholder="Search by invoice #, customer, title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="partially_paid">Partially Paid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                             <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                    <DateRangePicker />
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                       <TableCell>{invoice.customerName}</TableCell>
                       <TableCell>{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</TableCell>
                       <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                       <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", getInvoiceStatusStyles(invoice.status))}>
                          {invoice.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link href={getHref(`/dashboard/invoices/${invoice.id}`)}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Send</DropdownMenuItem>
                                 <DropdownMenuItem
                                    disabled={invoice.balanceDue <= 0}
                                    onSelect={() => alert('Redirecting to Stripe...')}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Pay with Stripe
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">No invoices found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> invoices.
            </div>
          </CardFooter>
        </Card>
    </div>
  )
}


export default function InvoicingPage() {
    return (
        <Suspense fallback={<div>Loading invoices...</div>}>
            <InvoicingPageContent />
        </Suspense>
    )
}
