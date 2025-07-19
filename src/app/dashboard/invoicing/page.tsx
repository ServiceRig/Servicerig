
'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn, getInvoiceStatusStyles } from '@/lib/utils';
import type { Invoice } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Plus, MoreHorizontal } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';

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

    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        return `${path}?${roleParam}`;
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <CardTitle>Invoicing</CardTitle>
                <CardDescription>Manage, send, and track all your customer invoices.</CardDescription>
            </div>
            <Button asChild>
                <Link href="#">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Link>
            </Button>
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
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
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
                      {invoice.status}
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
    </Card>
  )
}


export default function InvoicingPage() {
    return (
        <Suspense fallback={<div>Loading invoices...</div>}>
            <InvoicingPageContent />
        </Suspense>
    )
}
