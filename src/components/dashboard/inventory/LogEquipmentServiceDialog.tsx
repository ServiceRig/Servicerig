

'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addEquipmentLog } from '@/app/actions';
import type { Equipment, EquipmentLog } from '@/lib/types';

interface LogEquipmentServiceDialogProps {
  equipment: Equipment;
  technicianId: string;
  onUpdate: (updates: { equipmentLogs: EquipmentLog[] }) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Log'}
        </Button>
    )
}

export function LogEquipmentServiceDialog({ equipment, technicianId, onUpdate }: LogEquipmentServiceDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useActionState(addEquipmentLog, { success: false, message: '', equipmentLogs: [] });

    useEffect(() => {
        if (!isOpen) return; // Only run effect if dialog is open
        if (state?.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success && state.equipmentLogs) {
                onUpdate({ equipmentLogs: state.equipmentLogs });
                setIsOpen(false);
            }
        }
    }, [state, toast, onUpdate, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline" size="sm">
                    <Wrench className="mr-2 h-4 w-4" /> Log Service
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Service for {equipment.name}</DialogTitle>
                    <DialogDescription>Record a maintenance event for this piece of equipment.</DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="equipmentId" value={equipment.id} />
                    <input type="hidden" name="technicianId" value={technicianId} />
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="logType">Log Type</Label>
                            <Select name="logType" defaultValue="inspection">
                                <SelectTrigger id="logType">
                                    <SelectValue placeholder="Select log type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="usage">Usage</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" name="notes" placeholder="Describe the service performed..." required />
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
