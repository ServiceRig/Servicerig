

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockJobs, mockData } from '@/lib/mock-data';
import type { Job, Invoice } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Camera, UploadCloud, FileText } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// This would come from the logged-in user's context
const LOGGED_IN_TECHNICIAN_ID = 'tech1';

export default function TechnicianInvoicingPage() {
    const { toast } = useToast();
    const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [lineItems, setLineItems] = useState<{ description: string, quantity: number, unitPrice: number }[]>([]);
    
    const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
    const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
    const [internalNotes, setInternalNotes] = useState('');
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const jobs = mockJobs.filter(job => job.technicianId === LOGGED_IN_TECHNICIAN_ID && job.status === 'complete' && !job.invoiceId);
        setCompletedJobs(jobs);
    }, []);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
        getCameraPermission();
    }, [toast]);
    
    const capturePhoto = (type: 'before' | 'after') => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            if (type === 'before') {
                setBeforePhotos(prev => [...prev, dataUrl]);
            } else {
                setAfterPhotos(prev => [...prev, dataUrl]);
            }
             toast({ title: 'Photo Captured!', description: `The ${type} photo has been added.`});
        }
    };


    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleLineItemChange = (index: number, field: 'description' | 'quantity' | 'unitPrice', value: string | number) => {
        const newItems = [...lineItems];
        if (typeof value === 'string' && field !== 'description') {
            newItems[index][field] = parseFloat(value) || 0;
        } else {
            (newItems[index] as any)[field] = value;
        }
        setLineItems(newItems);
    };

    const handleSubmitForReview = () => {
        if (!selectedJob) return;

        const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        const newInvoice: Invoice = {
            id: `inv_${Math.random().toString(36).substring(2, 9)}`,
            invoiceNumber: `INV-${Date.now()}`,
            title: `Invoice for ${selectedJob.title}`,
            jobId: selectedJob.id,
            customerId: selectedJob.customerId,
            status: 'pending_review',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
            lineItems: lineItems,
            subtotal: subtotal,
            taxes: [{ name: 'Sales Tax', amount: tax, rate: 0.08 }],
            total: total,
            amountPaid: 0,
            balanceDue: total,
            internalNotes: internalNotes,
            notes: `Work completed by technician ${LOGGED_IN_TECHNICIAN_ID}. Before Photos: ${beforePhotos.length}, After Photos: ${afterPhotos.length}`,
            createdAt: new Date(),
        };
        
        // In a real app, this would be a server action
        mockData.invoices.unshift(newInvoice);
        const jobIndex = mockData.jobs.findIndex(j => j.id === selectedJob.id);
        if(jobIndex !== -1) {
            mockData.jobs[jobIndex].invoiceId = newInvoice.id;
        }

        toast({
            title: 'Invoice Submitted',
            description: 'Your invoice has been sent to the office for review.',
        });

        // Reset state
        setSelectedJobId('');
        setLineItems([]);
        setBeforePhotos([]);
        setAfterPhotos([]);
        setInternalNotes('');
        setCompletedJobs(jobs => jobs.filter(j => j.id !== selectedJob.id));
    };
    
    const selectedJob = completedJobs.find(job => job.id === selectedJobId);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Technician Invoice Creation</CardTitle>
                    <CardDescription>Create an invoice for a completed job directly from the field.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label htmlFor="job-select">Select Completed Job</Label>
                        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                            <SelectTrigger id="job-select">
                                <SelectValue placeholder="Select a job..." />
                            </SelectTrigger>
                            <SelectContent>
                                {completedJobs.map(job => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.title} (Customer: {job.customerName})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedJob && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billable Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-24">Qty</TableHead>
                                        <TableHead className="w-32">Price</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.map((item, index) => (
                                         <TableRow key={index}>
                                            <TableCell><Input placeholder="Service or Part" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)} /></TableCell>
                                            <TableCell><Input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)} /></TableCell>
                                            <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(index)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                         </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="link" onClick={handleAddLineItem} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Photos</CardTitle>
                            <CardDescription>Take before and after photos to document your work.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {hasCameraPermission === false && (
                                <Alert variant="destructive">
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access in your browser settings to use this feature.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Before Photos</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {beforePhotos.map((src, i) => <Image key={i} src={src} alt="Before" width={100} height={100} className="rounded-md object-cover aspect-square" />)}
                                    </div>
                                    <Button className="w-full" variant="outline" onClick={() => capturePhoto('before')} disabled={!hasCameraPermission}>
                                        <Camera className="mr-2 h-4 w-4"/> Take Before Photo
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>After Photos</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {afterPhotos.map((src, i) => <Image key={i} src={src} alt="After" width={100} height={100} className="rounded-md object-cover aspect-square" />)}
                                    </div>
                                    <Button className="w-full" variant="outline" onClick={() => capturePhoto('after')} disabled={!hasCameraPermission}>
                                        <Camera className="mr-2 h-4 w-4"/> Take After Photo
                                    </Button>
                                </div>
                            </div>
                            <div className="relative">
                                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                            </div>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader><CardTitle>Notes for Office</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea 
                                value={internalNotes} 
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Add any internal notes about the job, materials used, or customer interactions..." />
                        </CardContent>
                     </Card>
                     <div className="flex justify-end gap-2">
                        <Button variant="secondary">Save as Draft</Button>
                        <Button className="bg-accent hover:bg-accent/90" onClick={handleSubmitForReview}>
                           <FileText className="mr-2 h-4 w-4" /> Submit for Review
                        </Button>
                     </div>
                </div>
            )}
        </div>
    );
}
