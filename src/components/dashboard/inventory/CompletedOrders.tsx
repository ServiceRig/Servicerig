
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { mockData } from '@/lib/mock-data';
import type { PurchaseOrder } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Download, RotateCcw } from 'lucide-react';
import { unparse } from 'papaparse';

const getStatusStyles = (status: PurchaseOrder['status']) => {
  switch (status) {
    case 'received': return 'bg-green-500 text-white';
    case 'delivered': return 'bg-purple-500 text-white';
    case 'completed': return 'bg-green-600 text-white';
    case 'field-purchased': return 'bg-orange-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export function CompletedOrders({ searchTerm }: { searchTerm: string }) {
    const { toast } = useToast();
    const [completedPOs, setCompletedPOs] = useState<PurchaseOrder[]>(() => {
        return mockData.purchaseOrders.filter(po => 
            ['received', 'delivered', 'field-purchased', 'completed'].includes(po.status)
        );
    });

    const [showFieldPurchases, setShowFieldPurchases] = useState(true);

    const filteredPOs = useMemo(() => {
        return completedPOs.filter(po => {
            const matchesSearch = searchTerm ? (
                po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                po.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (po.receivedBy && po.receivedBy.toLowerCase().includes(searchTerm.toLowerCase()))
            ) : true;
            
            const matchesFieldPurchaseToggle = showFieldPurchases || !po.isFieldPurchase;

            return matchesSearch && matchesFieldPurchaseToggle;
        });
    }, [completedPOs, searchTerm, showFieldPurchases]);

    const handleExport = () => {
        const dataToExport = filteredPOs.map(po => ({
            'PO #': po.id,
            'Vendor': po.vendor,
            'Total Cost': po.total,
            'Status': po.status,
            'Received At': po.receivedAt ? format(new Date(po.receivedAt), 'PPpp') : 'N/A',
            'Received By': po.receivedBy || 'N/A',
        }));

        const csv = unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `completed-pos-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReopen = (poId: string) => {
        // In a real app, this would be a server action with admin role protection.
        const po = mockData.purchaseOrders.find(p => p.id === poId);
        if (po) {
            po.status = 'ordered'; // Revert to a previous state
        }
        setCompletedPOs(prev => prev.filter(p => p.id !== poId));
        toast({
            title: "PO Reopened",
            description: `Purchase Order ${poId.toUpperCase()} has been moved back to 'On-Order'.`,
        });
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Completed Orders</CardTitle>
                        <CardDescription>A history of all received, delivered, and field-purchased orders.</CardDescription>
                    </div>
                     <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                        id="field-purchases"
                        checked={showFieldPurchases}
                        onCheckedChange={(checked) => setShowFieldPurchases(!!checked)}
                    />
                    <Label htmlFor="field-purchases">Include Field Purchases</Label>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead>Received</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPOs.length > 0 ? filteredPOs.map(po => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.id.toUpperCase()}</TableCell>
                                <TableCell>{po.vendor}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(po.total)}</TableCell>
                                <TableCell>{po.receivedAt ? format(new Date(po.receivedAt), 'PP') : 'N/A'}</TableCell>
                                <TableCell><Badge className={cn('capitalize', getStatusStyles(po.status))}>{po.status.replace('-', ' ')}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleReopen(po.id)}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Re-open
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No completed orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
