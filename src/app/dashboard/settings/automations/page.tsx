
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const AutomationRule = ({ id, title, description, initialValue }: { id: string, title: string, description: string, initialValue: boolean }) => {
    const [isChecked, setIsChecked] = useState(initialValue);
    
    // In a real app, this would trigger a server action to update Firestore
    const handleToggle = (checked: boolean) => {
        setIsChecked(checked);
        console.log(`Toggled ${id}: ${checked}`);
    }

    return (
        <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor={id} className="text-base font-medium">
                    {title}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            <Switch
                id={id}
                checked={isChecked}
                onCheckedChange={handleToggle}
            />
        </div>
    )
}


export default function AutomationsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        // In a real app, this would submit all changed values via a server action
        toast({
            title: "Settings Saved",
            description: "Your automation settings have been updated.",
        });
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Automations</h1>
                    <p className="text-muted-foreground">
                        Set up rules to automate your workflow and save time.
                    </p>
                </div>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Invoice & Payment Automations</CardTitle>
                    <CardDescription>
                        Automate tasks related to invoicing to get paid faster.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AutomationRule
                        id="auto-create-invoice"
                        title="Auto-Create Invoice on Job Completion"
                        description="When a job's status is set to 'Complete', a draft invoice will be generated automatically."
                        initialValue={true}
                    />
                    <AutomationRule
                        id="auto-send-reminders"
                        title="Send Invoice Payment Reminders"
                        description="Automatically send email reminders for invoices that are due soon or overdue."
                        initialValue={true}
                    />
                    <AutomationRule
                        id="notify-overdue"
                        title="Notify Admin on Overdue Invoices"
                        description="Send an internal notification when an invoice becomes 3 days overdue."
                        initialValue={false}
                    />
                    <AutomationRule
                        id="auto-send-recurring"
                        title="Auto-Send for Recurring Agreements"
                        description="Automatically create and send invoices for active service agreements on their due date."
                        initialValue={true}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Customer Communications</CardTitle>
                    <CardDescription>
                       Automate communication with your customers at key moments.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <AutomationRule
                        id="auto-job-reminders"
                        title="Send Job Reminders"
                        description="Send an SMS and email reminder to the customer 24 hours before a scheduled job."
                        initialValue={true}
                    />
                     <AutomationRule
                        id="auto-review-request"
                        title="Request a Review After Job"
                        description="2 days after a job is completed, send an email asking the customer to leave a review."
                        initialValue={false}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
