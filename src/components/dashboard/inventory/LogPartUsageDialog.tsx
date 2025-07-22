

'use client';

import { useState, useEffect, useMemo, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logPartUsage } from '@/app/actions';
import type { InventoryItem, Job } from '@/lib/types';
import { mockData } from '@/lib/mock-data';
import { Textarea } from '@/components/ui/textarea';

interface LogPartUsageDialogProps {
  item: InventoryItem & { truckQuantity: number };
  technicianId: string;
  disabled?: boolean;
  onPartLogged: (updates: { inventory: InventoryItem[], jobs: Job[] }) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
            {pending ? 'Logging...' : 'Log Part Usage'}
        </Button>
    )
}

export function LogPartUsageDialog({ item, technicianId, disabled, onPartLogged }: LogPartUsageDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(logPartUsage, { success: false, message: '', inventory: [], jobs: [] });

    const technicianJobs = useMemo(() => {
        return mockData.jobs.filter(job => job.technicianId === technicianId && job.status !== 'complete');
    }, [technicianId]);

    useEffect(() => {
        if (!isOpen) return;
        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success && state.inventory && state.jobs) {
                onPartLogged({ inventory: state.inventory, jobs: state.jobs });
                setIsOpen(false);
            }
        }
    }, [state, toast, isOpen, onPartLogged]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                    <Wrench className="mr-2 h-4 w-4" /> Use Part
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Usage: {item.name}</DialogTitle>
                    <DialogDescription>
                        Log this part against a job to ensure accurate costing. 
                        Available on truck: {item.truckQuantity}.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="partId" value={item.id} />
                    <input type="hidden" name="technicianId" value={technicianId} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobId">Job</Label>
                             <Select name="jobId" required>
                                <SelectTrigger id="jobId">
                                    <SelectValue placeholder="Select a job" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technicianJobs.map(job => (
                                        <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity Used</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                required
                                defaultValue="1"
                                max={item.truckQuantity}
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="note">Notes (Optional)</Label>
                             <Textarea 
                                id="note"
                                name="note"
                                placeholder="e.g., Replaced damaged unit."
                             />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
