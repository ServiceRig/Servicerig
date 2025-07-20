
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockData } from '@/lib/mock-data';
import type { PartRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const LOGGED_IN_TECHNICIAN_ID = 'tech1';

const getStatusStyles = (status: PartRequest['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500 text-white';
    case 'fulfilled': return 'bg-green-500 text-white';
    case 'rejected': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export function MyRequests() {
    const { toast } = useToast();
    const [myRequests, setMyRequests] = useState<PartRequest[]>(() => {
        return mockData.partRequests.filter(req => req.technicianId === LOGGED_IN_TECHNICIAN_ID);
    });
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemJob, setNewItemJob] = useState('');
    const [newItemNotes, setNewItemNotes] = useState('');

    const handleCreateRequest = () => {
        if (!newItemName || newItemQty <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Request', description: 'Please enter a part name and quantity.' });
            return;
        }

        const newRequest: PartRequest = {
            id: `req_${Date.now()}`,
            technicianId: LOGGED_IN_TECHNICIAN_ID,
            technicianName: 'John Doe',
            itemName: newItemName,
            quantity: newItemQty,
            status: 'pending',
            jobId: newItemJob || undefined,
            notes: newItemNotes || undefined,
            createdAt: new Date(),
        };

        // This would be a server action in a real app
        mockData.partRequests.unshift(newRequest);
        setMyRequests(prev => [newRequest, ...prev]);

        toast({ title: 'Request Sent', description: `Your request for ${newItemName} has been submitted.` });
        
        // Reset form and close dialog
        setIsDialogOpen(false);
        setNewItemName('');
        setNewItemQty(1);
        setNewItemJob('');
        setNewItemNotes('');
    }

    const pendingRequests = useMemo(() => myRequests.filter(req => req.status === 'pending'), [myRequests]);
    const fulfilledRequests = useMemo(() => myRequests.filter(req => req.status !== 'pending'), [myRequests]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>My Part Requests</CardTitle>
                        <CardDescription>Track the status of parts you have requested.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-2">Pending Requests</h4>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Part</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                                     <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.itemName}</TableCell>
                                        <TableCell>{req.quantity}</TableCell>
                                        <TableCell>{format(new Date(req.createdAt), 'PP')}</TableCell>
                                        <TableCell><Badge className={getStatusStyles(req.status)}>{req.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No pending requests.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <h4 className="font-semibold mb-2 mt-6">Request History</h4>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Part</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fulfilledRequests.length > 0 ? fulfilledRequests.map(req => (
                                     <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.itemName}</TableCell>
                                        <TableCell>{req.quantity}</TableCell>
                                        <TableCell>{format(new Date(req.createdAt), 'PP')}</TableCell>
                                        <TableCell><Badge className={getStatusStyles(req.status)}>{req.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No past requests.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Quick Part Request</CardTitle>
                        <CardDescription>Need a part that's not in your stock?</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create New Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Part Request</DialogTitle>
                                    <DialogDescription>Fill out the details for the part you need.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="part-name">Part Name / Description</Label>
                                        <Input id="part-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g., 45/5 Dual Run Capacitor" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input id="quantity" type="number" value={newItemQty} onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="job-id">Job ID (Optional)</Label>
                                        <Input id="job-id" value={newItemJob} onChange={(e) => setNewItemJob(e.target.value)} placeholder="e.g., job1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Textarea id="notes" value={newItemNotes} onChange={(e) => setNewItemNotes(e.target.value)} placeholder="e.g., Customer needs this ASAP for AC to work." />
                                    </div>
                                </div>
                                <DialogFooter>
                                     <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                    <Button onClick={handleCreateRequest}>Submit Request</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
