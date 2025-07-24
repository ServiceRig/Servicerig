
'use client';

import { Suspense, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { addCustomer } from '@/app/actions';
import { useRole } from '@/hooks/use-role';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Customer'}
        </Button>
    )
}

function NewCustomerForm() {
  const { role } = useRole();
  const { toast } = useToast();
  const [state, formAction] = useActionState(addCustomer, { success: false, message: '', errors: null });

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Error creating customer',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
        <input type="hidden" name="role" value={role || ''} />
        <Card>
            <CardHeader>
                <CardTitle>Create New Customer</CardTitle>
                <CardDescription>Fill out the form below to add a new customer to your records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" placeholder="John" required/>
                        {state.errors?.firstName && <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" placeholder="Doe" required/>
                        {state.errors?.lastName && <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input id="companyName" name="companyName" placeholder="Innovate Inc." />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="john@example.com" required/>
                        {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" placeholder="555-123-4567" required/>
                        {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone[0]}</p>}
                    </div>
                </div>
                <div className="space-y-4">
                    <Label>Service Address</Label>
                    <div className="space-y-2">
                        <Label htmlFor="street" className="text-xs text-muted-foreground">Street</Label>
                        <Input id="street" name="street" placeholder="123 Main St" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                            <Input id="city" name="city" placeholder="Anytown" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-xs text-muted-foreground">State</Label>
                            <Input id="state" name="state" placeholder="CA" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zipCode" className="text-xs text-muted-foreground">Zip Code</Label>
                            <Input id="zipCode" name="zipCode" placeholder="12345" />
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end">
                    <SubmitButton />
                </div>
            </CardContent>
        </Card>
    </form>
  )
}

export default function NewCustomerPage() {
    return (
        <div className="max-w-4xl mx-auto">
             <Suspense fallback={<div>Loading...</div>}>
                <NewCustomerForm />
            </Suspense>
        </div>
    )
}
