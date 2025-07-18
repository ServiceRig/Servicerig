
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle, Loader2, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { LineItem, GbbTier, UserRole } from '@/lib/types';
import { createEstimateTemplateAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Template'}
        </Button>
    )
}

export default function NewEstimateTemplatePage() {
    const router = useRouter();
    const { role } = useRole();
    const { toast } = useToast();
    const [state, formAction] = useActionState(createEstimateTemplateAction, { success: false, message: null, errors: null });

    const [title, setTitle] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
    const [gbbTier, setGbbTier] = useState<GbbTier>({ good: '', better: '', best: '' });

    useEffect(() => {
        if (state?.success) {
            toast({
                title: 'Success',
                description: 'Estimate template created successfully.',
            });
            router.push(`/dashboard/settings/estimates?role=${role || 'admin'}`);
        }
        if (state?.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
    }, [state, router, toast, role]);

    const handleAddLineItem = () => setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
    const handleRemoveLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));
    
    const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...lineItems];
        (newItems[index] as any)[field] = value;
        setLineItems(newItems);
    };

    const handleTierChange = (tier: keyof GbbTier, value: string) => {
        setGbbTier(prev => ({...prev, [tier]: value}));
    }

    const subtotal = useMemo(() => lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [lineItems]);

    return (
        <form action={formAction}>
            <input type="hidden" name="lineItems" value={JSON.stringify(lineItems)} />
            <input type="hidden" name="gbbTier" value={JSON.stringify(gbbTier)} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">New Estimate Template</h1>
                        <p className="text-muted-foreground">Create a reusable template for common jobs.</p>
                    </div>
                    <SubmitButton />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Template Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="title">Template Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Water Heater Replacement" value={title} onChange={(e) => setTitle(e.target.value)} />
                                 {state?.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Line Items</CardTitle>
                                <CardDescription>These items will be pre-filled when this template is used.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60%]">Description</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lineItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Input placeholder="Part or Service" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="text-center" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="text-right" />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)} disabled={lineItems.length <= 1}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Button variant="link" onClick={handleAddLineItem} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" />Add Item</Button>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <div className="w-full max-w-xs space-y-2">
                                     <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Good/Better/Best Tiers</CardTitle>
                                <CardDescription>Optional descriptive text for pricing tiers.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="good-tier">Good</Label>
                                    <Textarea id="good-tier" value={gbbTier.good} onChange={(e) => handleTierChange('good', e.target.value)} placeholder="Basic service description..." />
                                </div>
                                 <div>
                                    <Label htmlFor="better-tier">Better</Label>
                                    <Textarea id="better-tier" value={gbbTier.better} onChange={(e) => handleTierChange('better', e.target.value)} placeholder="Enhanced service description..." />
                                </div>
                                 <div>
                                    <Label htmlFor="best-tier">Best</Label>
                                    <Textarea id="best-tier" value={gbbTier.best} onChange={(e) => handleTierChange('best', e.target.value)} placeholder="Premium service description..." />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </form>
    );
}
