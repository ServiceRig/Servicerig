
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function BillingSettingsPage() {
    const { toast } = useToast();
    
    // In a real app, this state would be fetched from Firestore settings/billing
    const [companyName, setCompanyName] = useState('ServiceRig');
    const [companyAddress, setCompanyAddress] = useState('123 Fire Street, Suite 101\nInferno, CA 91234');
    const [companyEin, setCompanyEin] = useState('12-3456789');
    const [defaultTerms, setDefaultTerms] = useState('Net 30');
    const [footerMessage, setFooterMessage] = useState('Thank you for your business!');
    const [lateFeeValue, setLateFeeValue] = useState(1.5);
    const [lateFeeType, setLateFeeType] = useState('percentage');

    const handleSaveChanges = () => {
        // Here you would call a server action to save the settings to Firestore.
        console.log("Saving billing settings...");
        toast({
            title: "Settings Saved",
            description: "Your billing settings have been updated.",
        })
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Billing Settings</h1>
                    <p className="text-muted-foreground">Manage your company's default invoicing and payment settings.</p>
                </div>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>This information will appear on your invoices and estimates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="companyEin">Company EIN/Tax ID</Label>
                        <Input id="companyEin" value={companyEin} onChange={e => setCompanyEin(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Textarea id="companyAddress" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} rows={3} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice & Estimate Defaults</CardTitle>
                    <CardDescription>Set default terms and messaging for new documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="defaultTerms">Default Payment Terms</Label>
                             <Select value={defaultTerms} onValueChange={setDefaultTerms}>
                                <SelectTrigger id="defaultTerms">
                                    <SelectValue placeholder="Select terms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Late Fee Policy</Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" value={lateFeeValue} onChange={e => setLateFeeValue(parseFloat(e.target.value) || 0)} className="w-24" />
                                <Select value={lateFeeType} onValueChange={setLateFeeType}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percent (%)</SelectItem>
                                        <SelectItem value="flat">Flat Fee ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="footerMessage">Default Footer Message</Label>
                        <Textarea id="footerMessage" value={footerMessage} onChange={e => setFooterMessage(e.target.value)} placeholder="e.g., Thank you for your business!" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Accepted Payment Methods</CardTitle>
                    <CardDescription>Configure which payment methods you accept via Stripe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center space-x-2">
                        <Checkbox id="card" defaultChecked />
                        <Label htmlFor="card">Credit & Debit Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ach" defaultChecked />
                        <Label htmlFor="ach">ACH Bank Transfer</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="applePay" />
                        <Label htmlFor="applePay">Apple Pay</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
