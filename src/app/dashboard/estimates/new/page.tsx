
'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { mockData } from '@/lib/mock-data';
import type { Customer, Job, EstimateTemplate, LineItem, PricebookItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AITierGenerator, TierData } from '@/components/dashboard/ai-tier-generator';
import { CustomerPresentationView } from '@/components/dashboard/customer-presentation-view';
import { addEstimate } from '@/app/actions';
import { SubmitButton } from './SubmitButton';
import { useRole } from '@/hooks/use-role';
import { PricebookSelector } from '@/components/dashboard/pricebook-selector';


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

function NewEstimatePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addEstimateState, formAction] = useActionState(addEstimate, { success: false, message: null });
  const { role } = useRole();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [estimateTitle, setEstimateTitle] = useState('');
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, inventoryParts: [] },
  ]);
  
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [gbbTiers, setGbbTiers] = useState<TierData[] | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);
  const [isPricebookOpen, setIsPricebookOpen] = useState(false);

  useEffect(() => {
    setCustomers(mockData.customers);
    setJobs(mockData.jobs);
    setTemplates(mockData.estimateTemplates);

    const initialTitle = searchParams.get('title');
    const initialLineItems = searchParams.get('lineItems');
    if (initialTitle) {
        setEstimateTitle(initialTitle);
    }
    if (initialLineItems) {
        try {
            const parsedItems = JSON.parse(initialLineItems);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                setLineItems(parsedItems.map((item: any) => ({ ...item, inventoryParts: item.inventoryParts || [] })));
            }
        } catch (error) {
            console.error("Failed to parse line items from URL", error);
        }
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (addEstimateState?.message && !addEstimateState.success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: addEstimateState.message,
      });
    }
  }, [addEstimateState, toast]);

  const filteredJobs = useMemo(() => {
    if (!selectedCustomerId) return [];
    return jobs.filter(job => job.customerId === selectedCustomerId);
  }, [selectedCustomerId, jobs]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, inventoryParts: [] }]);
  };
  
  const handleAddFromPricebook = (item: PricebookItem) => {
    const newLineItem: LineItem = {
      description: item.title,
      quantity: 1,
      unitPrice: item.price,
      inventoryParts: [{
        partId: item.id,
        quantity: 1, // Default to 1, can be adjusted by quantity of line item
        snapshot: {
          name: item.title,
          unitCost: (item as any).unitCost || 0, // Assuming unitCost is on some items
          ourPrice: item.price,
        }
      }]
    };
    
    // If the first line item is empty, replace it. Otherwise, add a new one.
    if (lineItems.length === 1 && lineItems[0].description === '' && lineItems[0].unitPrice === 0) {
      setLineItems([newLineItem]);
    } else {
      setLineItems([...lineItems, newLineItem]);
    }

    toast({ title: 'Item Added', description: `"${item.title}" was added to the estimate.` });
  };


  const handleRemoveLineItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    const item = newItems[index];

    if (field === 'quantity' || field === 'unitPrice') {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        item[field] = isNaN(numericValue) ? 0 : numericValue;
    } else {
        item[field] = value as string;
    }
    newItems[index].inventoryParts = item.inventoryParts || [];
    setLineItems(newItems);
  };

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => subtotal * (discountRate / 100), [subtotal, discountRate]);
  const subtotalAfterDiscount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  const taxAmount = useMemo(() => subtotalAfterDiscount * (taxRate / 100), [subtotalAfterDiscount, taxRate]);
  const grandTotal = useMemo(() => subtotalAfterDiscount + taxAmount, [subtotalAfterDiscount, taxRate]);

  useEffect(() => {
    if (selectedCustomerId && estimateTitle) {
      setIsFormSubmittable(true);
    } else {
      setIsFormSubmittable(false);
    }
  }, [selectedCustomerId, estimateTitle]);
  
  const handleTiersFinalized = useCallback((tiers: TierData[]) => {
    if (!selectedCustomerId) {
        toast({
            variant: "destructive",
            title: "Customer not selected",
            description: "Please select a customer before presenting options.",
        });
        return;
    }
    setGbbTiers(tiers);
    setShowPresentation(true);
    toast({
        title: "Displaying to Customer",
        description: "Presentation mode activated.",
    });
  }, [selectedCustomerId, toast]);

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setEstimateTitle(template.title);
    setLineItems(template.lineItems.map(item => ({ ...item, inventoryParts: item.inventoryParts || [] })));
    if (template.gbbTier) {
      setGbbTiers([
        { title: 'Good', description: template.gbbTier.good, price: undefined },
        { title: 'Better', description: template.gbbTier.better, price: undefined },
        { title: 'Best', description: template.gbbTier.best, price: undefined },
      ]);
    } else {
      setGbbTiers(null);
    }
    toast({
      title: "Template Loaded",
      description: `Loaded the "${template.title}" template.`,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const hiddenRoleInput = document.createElement('input');
    hiddenRoleInput.type = 'hidden';
    hiddenRoleInput.name = 'role';
    hiddenRoleInput.value = role || '';
    e.currentTarget.appendChild(hiddenRoleInput);
    formAction(formData);
    e.currentTarget.removeChild(hiddenRoleInput);
  }

  return (
    <>
    <PricebookSelector open={isPricebookOpen} onOpenChange={setIsPricebookOpen} onItemSelected={handleAddFromPricebook} />
    <CustomerPresentationView 
        isOpen={showPresentation}
        onOpenChange={setShowPresentation}
        tiers={gbbTiers || []}
        baseEstimateData={{
          customerId: selectedCustomerId,
          jobId: selectedJobId,
          title: estimateTitle
        }}
    />
    <div className="space-y-6">
      
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">New Estimate</h1>
                <p className="text-muted-foreground">Create a new estimate manually or load from a template.</p>
            </div>
            <SubmitButton disabled={!isFormSubmittable} />
        </div>

      <Separator />
      <form id="estimate-form" action={formAction}>
         {/* Hidden inputs for the form action */}
        <input type="hidden" name="customerId" value={selectedCustomerId} />
        <input type="hidden" name="jobId" value={selectedJobId} />
        <input type="hidden" name="title" value={estimateTitle} />
        <input type="hidden" name="role" value={role || ''} />
        <input type="hidden" name="lineItems" value={JSON.stringify(lineItems)} />
        <input type="hidden" name="gbbTier" value={gbbTiers ? JSON.stringify({
            good: gbbTiers.find(t => t.title === 'Good')?.description || '',
            better: gbbTiers.find(t => t.title === 'Better')?.description || '',
            best: gbbTiers.find(t => t.title === 'Best')?.description || '',
        }) : 'null'} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Select customer, job, and give the estimate a title.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="template">Load from Template</Label>
                        <Select onValueChange={handleLoadTemplate}>
                        <SelectTrigger id="template">
                            <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                                {template.title}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger id="customer">
                            <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.primaryContact.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="job">Job (Optional)</Label>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={!selectedCustomerId}>
                        <SelectTrigger id="job">
                            <SelectValue placeholder="Select a job" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredJobs.map(job => (
                            <SelectItem key={job.id} value={job.id}>
                                {job.title} (ID: {job.id})
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 md:col-span-2 lg:col-span-3">
                        <Label htmlFor="title">Estimate Title</Label>
                        <Input id="title" placeholder="e.g., HVAC Repair" value={estimateTitle} onChange={e => setEstimateTitle(e.target.value)} required />
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Line Items</CardTitle>
                            <CardDescription>Add services and parts to this estimate.</CardDescription>
                        </div>
                         <Button variant="outline" type="button" onClick={() => setIsPricebookOpen(true)}>
                            <BookOpen className="mr-2 h-4 w-4" /> Add from Price Book
                        </Button>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Description</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {lineItems.map((item, index) => (
                            <TableRow key={index}>
                            <TableCell>
                                <Input placeholder="Service or Part Description" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <Input type="number" placeholder="1" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="text-center" />
                            </TableCell>
                            <TableCell>
                                <Input type="number" placeholder="0.00" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="text-right" />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(item.quantity * item.unitPrice)}
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)} disabled={lineItems.length <= 1}>
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <Button variant="link" onClick={handleAddLineItem} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
                    </Button>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="discount" className="text-muted-foreground">Discount (%)</Label>
                                <Input id="discount" type="number" value={discountRate} onChange={e => setDiscountRate(parseFloat(e.target.value) || 0)} className="w-24 h-8 text-right" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tax" className="text-muted-foreground">Tax (%)</Label>
                                <Input id="tax" type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className="w-24 h-8 text-right" />
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Grand Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <AITierGenerator onTiersFinalized={handleTiersFinalized} />
            </div>
        </div>
      </form>
    </div>
    </>
  );
}

export default function NewEstimatePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewEstimatePageContent />
        </Suspense>
    )
}
