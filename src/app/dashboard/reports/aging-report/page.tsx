
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { mockData } from '@/lib/mock-data';
import { Invoice, Customer } from '@/lib/types';
import { differenceInDays, subDays } from 'date-fns';
import { Download } from 'lucide-react';
import { unparse } from 'papaparse';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

type AgingBuckets = {
    current: number;
    '31-60': number;
    '61-90': number;
    '90+': number;
    total: number;
};

type CustomerAgingData = {
    customerId: string;
    customerName: string;
    buckets: AgingBuckets;
};

// In a real app, this would be a server-side fetch with date range filters.
const getAgingData = (): CustomerAgingData[] => {
    const today = new Date();
    const customerAgingMap: Map<string, CustomerAgingData> = new Map();

    mockData.invoices.forEach(invoice => {
        if (invoice.balanceDue <= 0) return;

        const age = differenceInDays(today, new Date(invoice.dueDate));
        
        let bucket: keyof Omit<AgingBuckets, 'total'>;
        if (age <= 30) {
            bucket = 'current';
        } else if (age <= 60) {
            bucket = '31-60';
        } else if (age <= 90) {
            bucket = '61-90';
        } else {
            bucket = '90+';
        }

        let customerData = customerAgingMap.get(invoice.customerId);
        if (!customerData) {
            const customer = mockData.customers.find(c => c.id === invoice.customerId);
            customerData = {
                customerId: invoice.customerId,
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                buckets: { current: 0, '31-60': 0, '61-90': 0, '90+': 0, total: 0 },
            };
        }

        customerData.buckets[bucket] += invoice.balanceDue;
        customerData.buckets.total += invoice.balanceDue;
        
        customerAgingMap.set(invoice.customerId, customerData);
    });

    return Array.from(customerAgingMap.values());
};

export default function AgingReportPage() {
    const [agingData, setAgingData] = useState(getAgingData());
    const [customerFilter, setCustomerFilter] = useState('all');

    const filteredData = useMemo(() => {
        if (customerFilter === 'all') {
            return agingData;
        }
        return agingData.filter(data => data.customerId === customerFilter);
    }, [agingData, customerFilter]);
    
    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => {
            acc.current += curr.buckets.current;
            acc['31-60'] += curr.buckets['31-60'];
            acc['61-90'] += curr.buckets['61-90'];
            acc['90+'] += curr.buckets['90+'];
            acc.total += curr.buckets.total;
            return acc;
        }, { current: 0, '31-60': 0, '61-90': 0, '90+': 0, total: 0 });
    }, [filteredData]);

    const handleExport = () => {
         const dataToExport = filteredData.map(item => ({
            'Customer': item.customerName,
            'Current (0-30 days)': item.buckets.current,
            '31-60 Days': item.buckets['31-60'],
            '61-90 Days': item.buckets['61-90'],
            '90+ Days': item.buckets['90+'],
            'Total Outstanding': item.buckets.total,
        }));

        const csv = unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `aging-report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Invoice Aging Report</h1>
                    <p className="text-muted-foreground">Track outstanding receivables by customer.</p>
                </div>
                <div className="flex items-center gap-2">
                     <Select value={customerFilter} onValueChange={setCustomerFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by customer" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            {agingData.map(data => (
                                <SelectItem key={data.customerId} value={data.customerId}>{data.customerName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker />
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aging Summary</CardTitle>
                    <CardDescription>A summary of all outstanding invoices grouped by aging period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Current</TableHead>
                                <TableHead className="text-right">31-60 Days</TableHead>
                                <TableHead className="text-right">61-90 Days</TableHead>
                                <TableHead className="text-right">90+ Days</TableHead>
                                <TableHead className="text-right font-bold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((data) => (
                                <TableRow key={data.customerId}>
                                    <TableCell className="font-medium">{data.customerName}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.buckets.current)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.buckets['31-60'])}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.buckets['61-90'])}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.buckets['90+'])}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(data.buckets.total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.current)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals['31-60'])}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals['61-90'])}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals['90+'])}</TableCell>
                                <TableCell className="text-right">{formatCurrency(totals.total)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
