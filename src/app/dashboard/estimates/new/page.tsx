
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { mockCustomers, mockJobs, mockEstimateTemplates, mockEstimates } from '@/lib/mock-data';
import type { Customer, Job, EstimateTemplate, GbbTier, LineItem, UserRole, Estimate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AITierGenerator, TierData } from '@/components/dashboard/ai-tier-generator';
import { CustomerPresentationView } from '@/components/dashboard/customer-presentation-view';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function NewEstimatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { role } = useRole();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [estimateTitle, setEstimateTitle] = useState('');
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [gbbTiers, setGbbTiers] = useState<TierData[] | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this from Firestore
    setCustomers(mockCustomers);
    setJobs(mockJobs);
    setTemplates(mockEstimateTemplates);
  }, []);

  const filteredJobs = useMemo(() => {
    if (!selectedCustomerId) return [];
    return jobs.filter(job => job.customerId === selectedCustomerId);
  }, [selectedCustomerId, jobs]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
  };

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    const item = newItems[index];
    if(field === 'quantity' || field === 'unitPrice') {
        (item as any)[field] = parseFloat(value as string) || 0;
    } else {
        (item as any)[field] = value;
    }
    setLineItems(newItems);
  };

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => subtotal * (discountRate / 100), [subtotal, discountRate]);
  const subtotalAfterDiscount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  const taxAmount = useMemo(() => subtotalAfterDiscount * (taxRate / 100), [subtotalAfterDiscount, taxRate]);
  const grandTotal = useMemo(() => subtotalAfterDiscount + taxAmount, [subtotalAfterDiscount, taxAmount]);

  const saveEstimate = useCallback((status: Estimate['status'] = 'draft', customLineItems?: LineItem[], customTitle?: string) => {
    if (!selectedCustomerId) {
      toast({
        variant: 'destructive',
        title: "Missing Information",
        description: "Please select a customer before saving.",
      });
      return false;
    }

    const finalTitle = customTitle || estimateTitle;
    if (!finalTitle) {
      toast({
        variant: 'destructive',
        title: "Missing Information",
        description: "Please provide an estimate title.",
      });
      return false;
    }

    const finalLineItems = customLineItems || lineItems;
    const finalSubtotal = finalLineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const finalDiscount = status === 'accepted' ? 0 : finalSubtotal * (discountRate / 100);
    const finalSubtotalAfterDiscount = finalSubtotal - finalDiscount;
    const finalTax = status === 'accepted' ? 0 : finalSubtotalAfterDiscount * (taxRate / 100);
    const finalTotal = finalSubtotalAfterDiscount + finalTax;

    const newEstimate: Estimate = {
      id: `est_${Math.random().toString(36).substring(2, 9)}`,
      estimateNumber: `EST-${Math.floor(Math.random() * 9000) + 1000}`,
      customerId: selectedCustomerId,
      jobId: selectedJobId,
      title: finalTitle,
      lineItems: finalLineItems,
      subtotal: finalSubtotal,
      discount: finalDiscount,
      tax: finalTax,
      total: finalTotal,
      gbbTier: gbbTiers ? {
        good: gbbTiers.find(t => t.title === 'Good')?.description || '',
        better: gbbTiers.find(t => t.title === 'Better')?.description || '',
        best: gbbTiers.find(t => t.title === 'Best')?.description || '',
      } : null,
      status: status,
      createdBy: 'admin_user', // This would be the logged in user's ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEstimates.unshift(newEstimate);
    
    toast({
        title: "Estimate Created",
        description: `Estimate "${newEstimate.title}" has been saved with status: ${status}.`,
    });

    router.push(`/dashboard/estimates?role=${role || UserRole.Admin}`);
    return true;
  }, [selectedCustomerId, estimateTitle, lineItems, discountRate, taxRate, selectedJobId, gbbTiers, router, toast, role]);


  const handleSaveDraft = () => {
    saveEstimate('draft');
  }
  
  const handleTiersFinalized = useCallback((tiers: TierData[]) => {
    setGbbTiers(tiers);
    setShowPresentation(true);
    toast({
        title: "Displaying to Customer",
        description: "Presentation mode activated.",
    });
  }, [toast]);

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setEstimateTitle(template.title);
    setLineItems(template.lineItems);
    setGbbTiers(null); 
    toast({
      title: "Template Loaded",
      description: `Loaded the "${template.title}" template.`,
    });
  };

  const handleAcceptEstimate = useCallback((selectedTier: TierData) => {
      setShowPresentation(false);
      
      const acceptedLineItems = [{ description: selectedTier.description, quantity: 1, unitPrice: selectedTier.price || 0 }];
      const acceptedTitle = `${estimateTitle || 'Estimate'} - ${selectedTier.title} Option`;

      saveEstimate('accepted', acceptedLineItems, acceptedTitle);

  }, [saveEstimate, estimateTitle]);


  return (
    <>
    <CustomerPresentationView 
        isOpen={showPresentation}
        onOpenChange={setShowPresentation}
        tiers={gbbTiers || []}
        onAccept={handleAcceptEstimate}
    />
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">New Estimate</h1>
            <p className="text-muted-foreground">Create a new estimate manually or load from a template.</p>
        </div>
        <Button onClick={handleSaveDraft}>Save as Draft</Button>
      </div>

      <Separator />

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
                      <Input id="title" placeholder="e.g., HVAC Repair" value={estimateTitle} onChange={e => setEstimateTitle(e.target.value)} />
                  </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add services and parts to this estimate.</CardDescription>
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
    </div>
    </>
  );
}

    

    