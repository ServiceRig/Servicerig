
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockData } from '@/lib/mock-data';
import type { PartRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

export function PendingRequests() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<PartRequest[]>(() => {
        return mockData.partRequests.filter(req => req.status === 'pending');
    });

    const handleRequestAction = (requestId: string, action: 'approve' | 'deny') => {
        const request = mockData.partRequests.find(r => r.id === requestId);
        if (!request) return;

        const newStatus = action === 'approve' ? 'fulfilled' : 'rejected';
        request.status = newStatus;
        if (action === 'approve') {
            request.fulfilledAt = new Date();
            // In a real app, this would trigger further logic:
            // - If part is in stock, create a "pick ticket"
            // - If part is not in stock, add to shopping list
            mockData.shoppingList = mockData.shoppingList || [];
            mockData.shoppingList.push({
                itemId: request.itemId!,
                itemName: request.itemName,
                quantityNeeded: request.quantity,
                requestId: request.id
            });
        }
        
        // Update local state to remove from this view
        setRequests(prev => prev.filter(r => r.id !== requestId));

        toast({
            title: `Request ${action === 'approve' ? 'Approved' : 'Denied'}`,
            description: `The request for ${request.itemName} has been updated.`,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Part Requests</CardTitle>
                <CardDescription>Review and process part requests from technicians in the field.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Technician</TableHead>
                            <TableHead>Part</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.technicianName}</TableCell>
                                <TableCell>{req.itemName}</TableCell>
                                <TableCell>{req.quantity}</TableCell>
                                <TableCell>{format(new Date(req.createdAt), 'PP')}</TableCell>
                                <TableCell>{req.jobId || 'N/A'}</TableCell>
                                <TableCell>{req.notes || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="icon" onClick={() => handleRequestAction(req.id, 'approve')}>
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleRequestAction(req.id, 'deny')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={7} className="h-24 text-center">No pending requests.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
