
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { mockData } from '@/lib/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ServiceAgreement } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { Plus, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const getStatusStyles = (status: ServiceAgreement['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'paused':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'cancelled':
    case 'expired':
      return 'bg-red-500 hover:bg-red-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
};

export default function ServiceAgreementsPage() {
    const { role } = useRole();
    const { toast } = useToast();
    const [agreements, setAgreements] = useState<ServiceAgreement[]>(() => {
        const enriched = mockData.serviceAgreements.map(sa => ({
            ...sa,
            customerName: mockData.customers.find(c => c.id === sa.customerId)?.primaryContact.name || 'Unknown Customer',
        }));
        return enriched;
    });

    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgreements = useMemo(() => {
        return agreements.filter(agreement =>
            (agreement.customerName && agreement.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            agreement.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agreements, searchTerm]);

    const handleToggleAutoInvoice = (id: string, enabled: boolean) => {
        setAgreements(prev => prev.map(agr => agr.id === id ? { ...agr, autoInvoiceEnabled: enabled } : agr));
        toast({
            title: 'Setting Updated',
            description: `Auto-invoicing for agreement ${id} has been ${enabled ? 'enabled' : 'disabled'}.`
        })
    }

    const getHref = (path: string) => {
        let roleParam = role ? `role=${role}` : '';
        return `${path}?${roleParam}`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Service Agreements</CardTitle>
                        <CardDescription>Manage recurring service contracts and automated billing.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link href="#">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Agreement
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="mt-4">
                    <Input 
                        placeholder="Search by agreement title or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Next Due</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Auto-Invoice</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAgreements.length > 0 ? filteredAgreements.map((agreement) => (
                            <TableRow key={agreement.id}>
                                <TableCell className="font-medium">{agreement.title}</TableCell>
                                <TableCell>{agreement.customerName}</TableCell>
                                <TableCell className="capitalize">{agreement.billingSchedule.frequency}</TableCell>
                                <TableCell>{format(new Date(agreement.billingSchedule.nextDueDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Badge className={cn("capitalize", getStatusStyles(agreement.status))}>
                                        {agreement.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={agreement.autoInvoiceEnabled}
                                        onCheckedChange={(checked) => handleToggleAutoInvoice(agreement.id, checked)}
                                        aria-label="Toggle auto-invoicing"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit Agreement</DropdownMenuItem>
                                            <DropdownMenuItem>Pause Agreement</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                Cancel Agreement
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">No service agreements found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
