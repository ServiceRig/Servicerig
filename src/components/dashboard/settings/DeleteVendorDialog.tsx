

'use client';

import { useState, useEffect } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteVendor } from '@/app/actions';
import type { Vendor } from '@/lib/types';

interface DeleteVendorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    vendor: Vendor;
    onVendorDeleted: (vendorId: string) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <AlertDialogAction asChild>
            <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {pending ? 'Deleting...' : 'Delete Vendor'}
            </Button>
        </AlertDialogAction>
    )
}

export function DeleteVendorDialog({ isOpen, onOpenChange, vendor, onVendorDeleted }: DeleteVendorDialogProps) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(deleteVendor, { success: false, message: '' });

    useEffect(() => {
        if (!isOpen) return;

        if (state.message) {
            toast({
                title: state.success ? 'Success' : 'Error',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                onVendorDeleted(vendor.id);
                onOpenChange(false);
            }
        }
    }, [state, toast, onOpenChange, onVendorDeleted, vendor.id, isOpen]);

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="vendorId" value={vendor.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the vendor
                             "{vendor.name}" from your records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
