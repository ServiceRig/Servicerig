
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/lib/types';
import { Loader2, Save } from 'lucide-react';
import { updateCustomer } from '@/app/actions';

interface EditCustomerDialogProps {
  customer: Customer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerUpdate: (updatedCustomer: Customer) => void;
  children: React.ReactNode;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

export function EditCustomerDialog({ customer, isOpen, onOpenChange, onCustomerUpdate, children }: EditCustomerDialogProps) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateCustomer, { success: false, message: '', errors: null });
  
  useEffect(() => {
    if (!isOpen) return; // Don't run effect if dialog is closed
    
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success && state.customer) {
        onCustomerUpdate(state.customer);
        onOpenChange(false);
      }
    }
  }, [state, toast, onOpenChange, onCustomerUpdate, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update the details for {customer.primaryContact.name}.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
            <input type="hidden" name="id" value={customer.id} />
            <div className="grid md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" defaultValue={customer.primaryContact.firstName} />
                    {state.errors?.firstName && <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" defaultValue={customer.primaryContact.lastName} />
                     {state.errors?.lastName && <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" defaultValue={customer.companyInfo.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={customer.primaryContact.phone} />
                    {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={customer.primaryContact.email} />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input id="street" name="street" defaultValue={customer.companyInfo.address.street} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" defaultValue={customer.companyInfo.address.city} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" defaultValue={customer.companyInfo.address.state} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" name="zipCode" defaultValue={customer.companyInfo.address.zipCode} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    