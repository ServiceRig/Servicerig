
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import { StatCard } from '@/components/dashboard/stat-card';
import { DollarSign, User, Percent, TrendingUp } from 'lucide-react';
import { Invoice, Technician } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// In a real app, this would be a server-side fetch with date range filters.
const getCommissionData = () => {
    const commissionEntries = mockData.invoices
        .filter(invoice => invoice.commission && invoice.commission.length > 0)
        .flatMap(invoice => 
            invoice.commission!.map(c => ({
                ...c,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                invoiceTotal: invoice.total,
                invoiceDate: invoice.issueDate,
                customerName: mockData.customers.find(cust => cust.id === invoice.customerId)?.primaryContact.name || 'Unknown',
            }))
        );
    return commissionEntries;
}

export default function TechnicianEarningsPage() {
    const [allCommissions, setAllCommissions] = useState(getCommissionData());
    const [technicians, setTechnicians] = useState<Technician[]>(mockData.technicians);
    const [selectedTech, setSelectedTech] = useState('all');

    const filteredCommissions = useMemo(() => {
        if (selectedTech === 'all') {
            return allCommissions;
        }
        return allCommissions.filter(c => c.technicianId === selectedTech);
    }, [allCommissions, selectedTech]);

    const totalCommission = useMemo(() => {
        return filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
    }, [filteredCommissions]);
    
    const totalRevenue = useMemo(() => {
        const uniqueInvoiceIds = new Set(filteredCommissions.map(c => c.invoiceId));
        return Array.from(uniqueInvoiceIds).reduce((sum, id) => {
            const invoice = mockData.invoices.find(inv => inv.id === id);
            return sum + (invoice?.total || 0);
        }, 0);
    }, [filteredCommissions]);

    const avgCommissionRate = useMemo(() => {
        if (filteredCommissions.length === 0) return 0;
        const totalRate = filteredCommissions.reduce((sum, c) => sum + c.rate, 0);
        return totalRate / filteredCommissions.length;
    }, [filteredCommissions]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Technician Earnings</h1>
                    <p className="text-muted-foreground">Track and analyze technician commissions.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Select value={selectedTech} onValueChange={setSelectedTech}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by technician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Technicians</SelectItem>
                            {technicians.map(tech => (
                                <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Commission" value={formatCurrency(totalCommission)} change="in selected period" icon={DollarSign} />
                <StatCard title="Total Revenue Generated" value={formatCurrency(totalRevenue)} change="by selected tech(s)" icon={TrendingUp} />
                <StatCard title="Average Commission Rate" value={`${(avgCommissionRate * 100).toFixed(1)}%`} change="across all jobs" icon={Percent} />
                <StatCard title="Top Earner" value={allCommissions.sort((a,b) => b.amount - a.amount)[0]?.technicianName || 'N/A'} change="in selected period" icon={User} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Commission Details</CardTitle>
                    <CardDescription>A detailed list of all invoices with paid commissions in the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Technician</TableHead>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Invoice Total</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCommissions.map((commission, index) => (
                                <TableRow key={`${commission.invoiceId}-${index}`}>
                                    <TableCell className="font-medium">{commission.technicianName}</TableCell>
                                    <TableCell>
                                        <Button variant="link" asChild className="p-0 h-auto">
                                            <Link href={`/dashboard/invoices/${commission.invoiceId}`}>{commission.invoiceNumber}</Link>
                                        </Button>
                                    </TableCell>
                                    <TableCell>{commission.customerName}</TableCell>
                                    <TableCell>{format(new Date(commission.invoiceDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(commission.invoiceTotal)}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(commission.amount)}</TableCell>
                                </TableRow>
                            ))}
                             {filteredCommissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No commission data found for the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
