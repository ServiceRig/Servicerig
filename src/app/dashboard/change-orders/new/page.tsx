
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { mockData } from '@/lib/mock-data';
import type { Customer, Job, LineItem, ChangeOrder } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

function NewChangeOrderPageContent() {
  const { toast } = useToast();
  const { role } = useRole();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>(mockData.jobs);
  
  const [selectedJobId, setSelectedJobId] = useState(searchParams.get('jobId') || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        (item as any)[field] = isNaN(numericValue) ? 0 : numericValue;
    } else {
        (item as any)[field] = value as string;
    }
    newItems[index] = item;
    setLineItems(newItems);
  };
  
  const subtotal = useMemo(() => lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0), [lineItems]);
  const taxAmount = subtotal * 0.08; // Placeholder tax
  const grandTotal = subtotal + taxAmount;

  const handleSave = () => {
      if (!selectedJobId || !title || lineItems.length === 0) {
          toast({
              variant: 'destructive',
              title: 'Missing Information',
              description: 'Please select a job, provide a title, and add at least one line item.'
          });
          return;
      }

      const selectedJob = jobs.find(j => j.id === selectedJobId);
      if (!selectedJob) {
          toast({ variant: 'destructive', title: 'Job not found' });
          return;
      }
      
      const newChangeOrder: ChangeOrder = {
          id: `co_${Date.now()}`,
          jobId: selectedJobId,
          customerId: selectedJob.customerId,
          title,
          description,
          lineItems,
          total: grandTotal,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
      };

      // In a real app, this would be a server action
      mockData.changeOrders.unshift(newChangeOrder);
      
      toast({
          title: 'Change Order Created',
          description: `Draft for "${title}" has been saved.`
      });

      // Potentially redirect or clear form
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">New Change Order</h1>
                <p className="text-muted-foreground">Create a change order for an existing job.</p>
            </div>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save as Draft
            </Button>
        </div>

      <Separator />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
              <Card>
                  <CardHeader>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>Select the job this change order belongs to and provide a title.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="grid gap-2">
                      <Label htmlFor="job">Link to Job</Label>
                      <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                      <SelectTrigger id="job">
                          <SelectValue placeholder="Select a job..." />
                      </SelectTrigger>
                      <SelectContent>
                          {jobs.map(job => (
                            <SelectItem key={job.id} value={job.id}>
                                {job.title} (Customer: {mockData.customers.find(c => c.id === job.customerId)?.primaryContact.name})
                            </SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="title">Change Order Title</Label>
                      <Input id="title" placeholder="e.g., Upgrade to Smart Thermostat" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                   <div className="grid gap-2">
                      <Label htmlFor="description">Description of Change</Label>
                      <Textarea id="description" placeholder="Describe the reason for the change and the work involved..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Line Items</CardTitle>
                      <CardDescription>Add services and parts for this change order.</CardDescription>
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
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)}>
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
              </Card>
          </div>
          <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Totals</CardTitle>
                </CardHeader>
                 <CardContent className="w-full space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                        <span>Grand Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                </CardContent>
             </Card>
          </div>
      </div>
    </div>
  );
}

export default function NewChangeOrderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewChangeOrderPageContent />
        </Suspense>
    )
}
