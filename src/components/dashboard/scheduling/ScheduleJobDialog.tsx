

'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PlusCircle, UserPlus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import type { Customer, Equipment, Job, Technician } from '@/lib/types';
import { format, setHours, setMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { addJob } from '@/lib/firestore/jobs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const timeOptions = Array.from({ length: 96 }, (_, i) => { // 96 quarters in a day
    const totalMinutes = i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const date = setMinutes(setHours(new Date(), hours), minutes);
    return {
        value: format(date, 'HH:mm'),
        label: format(date, 'h:mm a'),
    };
});


const arrivalWindows = [
    '8:00 AM – 10:00 AM',
    '10:00 AM – 12:00 PM',
    '12:00 PM – 2:00 PM',
    '2:00 PM – 4:00 PM',
    '4:00 PM – 6:00 PM',
];

const initialNewCustomerState = {
    name: '',
    email: '',
    phone: '',
    address: '',
};

interface ScheduleJobDialogProps {
    onJobCreated: (newJob: Job) => void;
    initialJobData?: Partial<Job & {schedule: Partial<Job['schedule']>}>;
    triggerButton?: React.ReactElement;
}

export function ScheduleJobDialog({ onJobCreated, initialJobData, triggerButton }: ScheduleJobDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerEquipment, setCustomerEquipment] = useState<Equipment[]>([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
    const [trade, setTrade] = useState<'Plumbing' | 'HVAC' | 'Electrical' | 'Other'>('Other');
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primaryTechnicianId, setPrimaryTechnicianId] = useState<string>('');
    const [additionalTechnicians, setAdditionalTechnicians] = useState<Set<string>>(new Set());
    
    // Default single-range scheduling state
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('10:00');
    const [arrivalWindow, setArrivalWindow] = useState<string>('');
    const [isUnscheduled, setIsUnscheduled] = useState(false);

    // New state for multi-segment scheduling
    const [hasDifferentTimes, setHasDifferentTimes] = useState(false);
    const [timeSegments, setTimeSegments] = useState([{ date: new Date(), startTime: '08:00', endTime: '10:00' }]);

    // New Customer State
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerState);

    // Data from mock
    const [allCustomers, setAllCustomers] = useState<Customer[]>(mockData.customers as Customer[]);
    const allTechnicians = mockData.technicians as Technician[];
    const allEquipment = mockData.equipment as Equipment[];

    useEffect(() => {
        if (isOpen && initialJobData) {
            setTitle(initialJobData.title || '');
            setDescription(initialJobData.description || '');
            if (initialJobData.schedule?.start) {
                const start = new Date(initialJobData.schedule.start);
                setStartDate(start);
                setStartTime(format(start, 'HH:mm'));
            }
             if (initialJobData.schedule?.end) {
                const end = new Date(initialJobData.schedule.end);
                setEndDate(end);
                setEndTime(format(end, 'HH:mm'));
            }
        }
    }, [initialJobData, isOpen]);


    useEffect(() => {
        if (selectedCustomer) {
            const equipment = allEquipment.filter(e => selectedCustomer.equipmentIds?.includes(e.id));
            setCustomerEquipment(equipment);
        } else {
            setCustomerEquipment([]);
        }
        setSelectedEquipmentId('');
    }, [selectedCustomer, allEquipment]);

    const handleSelectCustomer = (customerId: string) => {
        const customer = allCustomers.find(c => c.id === customerId);
        setSelectedCustomer(customer || null);
    };

    const handleMultiTechSelect = (techId: string) => {
        setAdditionalTechnicians(prev => {
            const newSet = new Set(prev);
            if(newSet.has(techId)) {
                newSet.delete(techId);
            } else {
                newSet.add(techId);
            }
            return newSet;
        });
    }
    
    // Segment handling functions
    const handleSegmentChange = (index: number, field: 'date' | 'startTime' | 'endTime', value: Date | string) => {
        const newSegments = [...timeSegments];
        const segment = { ...newSegments[index] };
    
        if (field === 'date' && value instanceof Date) {
            segment.date = value;
        } else if (typeof value === 'string') {
            (segment as any)[field] = value;
        }
    
        newSegments[index] = segment;
        setTimeSegments(newSegments);
    };
    const addSegment = () => setTimeSegments([...timeSegments, { date: new Date(), startTime: '08:00', endTime: '10:00' }]);
    const removeSegment = (index: number) => setTimeSegments(timeSegments.filter((_, i) => i !== index));

    const handleNewCustomerInputChange = (field: keyof typeof initialNewCustomerState, value: string) => {
        setNewCustomerData(prev => ({...prev, [field]: value}));
    };

    const handleSaveNewCustomer = () => {
        if (!newCustomerData.name || !newCustomerData.email || !newCustomerData.phone) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please provide name, email, and phone for the new customer.'});
            return;
        }

        const newCustomer: Customer = {
            id: `cust_${Date.now()}`,
            primaryContact: { name: newCustomerData.name, email: newCustomerData.email, phone: newCustomerData.phone },
            companyInfo: { name: newCustomerData.name, address: newCustomerData.address }, // Using name as company name for simplicity
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // In a real app, this would be a server action
        mockData.customers.unshift(newCustomer);
        setAllCustomers([...mockData.customers]); // Update local state from the single source of truth

        toast({ title: 'Customer Created', description: `${newCustomer.primaryContact.name} has been added.`});
        
        setSelectedCustomer(newCustomer);
        setIsCreatingCustomer(false);
        setNewCustomerData(initialNewCustomerState);
    };

    const resetForm = () => {
        setSelectedCustomer(null);
        setTrade('Other');
        setCategory('');
        setDescription('');
        setTitle('');
        setPrimaryTechnicianId('');
        setAdditionalTechnicians(new Set());
        setStartDate(new Date());
        setEndDate(new Date());
        setStartTime('08:00');
        setEndTime('10:00');
        setArrivalWindow('');
        setIsUnscheduled(false);
        setIsCreatingCustomer(false);
        setHasDifferentTimes(false);
        setTimeSegments([{ date: new Date(), startTime: '08:00', endTime: '10:00' }]);
    };
    
    const handleSave = async () => {
        if (!selectedCustomer || !trade || !description || (!isUnscheduled && !primaryTechnicianId)) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all required fields.' });
            return;
        }
    
        if (hasDifferentTimes) {
            console.log("Creating multi-segment job with segments:", timeSegments);
            try {
                for (const segment of timeSegments) {
                    const [startH, startM] = segment.startTime.split(':').map(Number);
                    const [endH, endM] = segment.endTime.split(':').map(Number);
                    const finalStartDate = setMinutes(setHours(new Date(segment.date), startH), startM);
                    const finalEndDate = setMinutes(setHours(new Date(segment.date), endH), endM);
    
                    const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
                        customerId: selectedCustomer.id,
                        technicianId: primaryTechnicianId,
                        additionalTechnicians: Array.from(additionalTechnicians),
                        equipmentId: selectedEquipmentId,
                        status: 'scheduled',
                        title: title || `${trade} Service for ${selectedCustomer.primaryContact.name}`,
                        description,
                        details: { serviceType: trade, trade, category },
                        schedule: { start: finalStartDate, end: finalEndDate, arrivalWindow, multiDay: true, unscheduled: false },
                        duration: (finalEndDate.getTime() - finalStartDate.getTime()) / (1000 * 60),
                    };
    
                    const createdJob = await addJob(newJob);
                    onJobCreated(createdJob);
                }
    
                toast({
                    title: 'Multi-Day Job Scheduled',
                    description: `Created ${timeSegments.length} jobs for ${selectedCustomer.primaryContact.name}.`
                });
                resetForm();
                setIsOpen(false);
    
            } catch (error) {
                console.error("Error creating multi-segment job:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule multi-day job.' });
            }
        } else {
            // Single day/range job logic
            if (!startDate) {
                toast({ variant: 'destructive', title: 'Invalid Dates', description: 'Please select a valid start date.' });
                return;
            }
            const finalEndDateValue = endDate || startDate;

            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            const finalStartDate = setMinutes(setHours(startDate, startH), startM);
            const finalEndDate = setMinutes(setHours(finalEndDateValue, endH), endM);
            
            if (finalEndDate < finalStartDate) {
                toast({ variant: 'destructive', title: 'Invalid Times', description: 'End time cannot be before the start time.' });
                return;
            }

            const newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> = {
                customerId: selectedCustomer.id,
                technicianId: primaryTechnicianId,
                additionalTechnicians: Array.from(additionalTechnicians),
                equipmentId: selectedEquipmentId,
                status: isUnscheduled ? 'unscheduled' : 'scheduled',
                title: title || `${trade} Service for ${selectedCustomer.primaryContact.name}`,
                description,
                details: { serviceType: trade, trade, category },
                schedule: { start: finalStartDate, end: finalEndDate, arrivalWindow: isUnscheduled ? undefined : arrivalWindow, multiDay: finalStartDate.toDateString() !== finalEndDate.toDateString(), unscheduled: isUnscheduled },
                duration: (finalEndDate.getTime() - finalStartDate.getTime()) / (1000 * 60),
            };
            
            try {
                console.log("Creating job with data:", newJob);
                const createdJob = await addJob(newJob);
                console.log("Job created successfully:", createdJob);
                console.log("Calling onJobCreated with:", createdJob);
                onJobCreated(createdJob);
                toast({ title: 'Job Scheduled', description: `Job for ${selectedCustomer.primaryContact.name} has been created.` });
                resetForm();
                setIsOpen(false);
            } catch (error) {
                console.error("Error creating job:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule job.' });
            }
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerButton ? React.cloneElement(triggerButton, { onClick: () => setIsOpen(true) }) : (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Schedule Job
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                 <DialogHeader>
                    <DialogTitle>Schedule a New Job</DialogTitle>
                    <DialogDescription>Fill in the details to add a new job to the schedule.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto space-y-6 p-1">
                    {/* Customer Section */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-4">Customer</h3>
                        {isCreatingCustomer ? (
                            <div className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Full Name</Label><Input value={newCustomerData.name} onChange={e => handleNewCustomerInputChange('name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCustomerData.email} onChange={e => handleNewCustomerInputChange('email', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Phone</Label><Input value={newCustomerData.phone} onChange={e => handleNewCustomerInputChange('phone', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Address</Label><Input value={newCustomerData.address} onChange={e => handleNewCustomerInputChange('address', e.target.value)} /></div>
                                 </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleSaveNewCustomer}>Save Customer</Button>
                                    <Button variant="ghost" onClick={() => setIsCreatingCustomer(false)}>Cancel</Button>
                                 </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Select Customer</Label>
                                    <Select onValueChange={handleSelectCustomer} value={selectedCustomer?.id || ''}>
                                        <SelectTrigger><SelectValue placeholder="Search by name, phone..." /></SelectTrigger>
                                        <SelectContent>
                                            {allCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.primaryContact.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="outline" className="self-end" onClick={() => setIsCreatingCustomer(true)}><UserPlus className="mr-2 h-4 w-4"/> New Customer</Button>

                                {selectedCustomer && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Customer Equipment (Optional)</Label>
                                        <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                                            <SelectTrigger><SelectValue placeholder="Select equipment..." /></SelectTrigger>
                                            <SelectContent>
                                                {customerEquipment.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.name} ({eq.serial})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Job Details Section */}
                     <div className="p-4 border rounded-lg">
                         <h3 className="font-semibold mb-4">Job Details</h3>
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Job Title</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Annual HVAC Maintenance"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Service Sector</Label>
                                    <Select value={trade} onValueChange={(v) => setTrade(v as any)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                                            <SelectItem value="HVAC">HVAC</SelectItem>
                                            <SelectItem value="Electrical">Electrical</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Service Category</Label>
                                    <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Drain Cleaning, AC Repair" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Service Description</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the work to be done..."/>
                            </div>
                        </div>
                     </div>
                     
                     {/* Technician Assignment */}
                    <div className="p-4 border rounded-lg">
                         <h3 className="font-semibold mb-4">Technician Assignment</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label>Primary Technician</Label>
                                  <Select value={primaryTechnicianId} onValueChange={setPrimaryTechnicianId}>
                                      <SelectTrigger><SelectValue placeholder="Select primary tech"/></SelectTrigger>
                                      <SelectContent>
                                          {allTechnicians.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label>Additional Technicians</Label>
                                  {/* This is a simplified multi-select */}
                                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                                      {allTechnicians.filter(t => t.id !== primaryTechnicianId).map(t => (
                                          <Button key={t.id} type="button" variant={additionalTechnicians.has(t.id) ? 'default' : 'outline'} size="sm" onClick={() => handleMultiTechSelect(t.id)}>{t.name}</Button>
                                      ))}
                                  </div>
                              </div>
                         </div>
                     </div>

                    {/* Scheduling Options */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-4">Scheduling</h3>
                         <div className="flex items-center space-x-2 mb-4">
                            <Checkbox id="unscheduled" checked={isUnscheduled} onCheckedChange={(checked) => setIsUnscheduled(!!checked)} />
                            <Label htmlFor="unscheduled">Add to Unscheduled Jobs list</Label>
                        </div>
                         <div className="flex items-center space-x-2 mb-4">
                            <Checkbox id="different-times" checked={hasDifferentTimes} onCheckedChange={(checked) => setHasDifferentTimes(!!checked)} />
                            <Label htmlFor="different-times">Different Times on Days</Label>
                        </div>
                        <div className={cn("space-y-4", (isUnscheduled) && "opacity-50 pointer-events-none")}>
                            {!hasDifferentTimes ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" side="bottom" align="start">
                                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                 <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" side="bottom" align="start">
                                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Select value={startTime} onValueChange={setStartTime}><SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>{timeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Select value={endTime} onValueChange={setEndTime}><SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>{timeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    </div>
                                    <div className="space-y-2">
                                    <Label>Arrival Window</Label>
                                    <Select value={arrivalWindow} onValueChange={setArrivalWindow}><SelectTrigger><SelectValue placeholder="Select window"/></SelectTrigger>
                                        <SelectContent>{arrivalWindows.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </>
                            ) : (
                                <div className="space-y-4">
                                    {timeSegments.map((segment, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded-md">
                                            <div className="space-y-1">
                                                <Label>Date</Label>
                                                <Popover modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button type="button" variant={'outline'} className={cn("w-full justify-start text-left font-normal")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {segment.date ? format(segment.date, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={segment.date}
                                                            onSelect={(date) => date && handleSegmentChange(index, 'date', date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                             <div className="space-y-1">
                                                <Label>Start Time</Label>
                                                <Select value={segment.startTime} onValueChange={v => handleSegmentChange(index, 'startTime', v)}><SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>{timeOptions.map(t => <SelectItem key={`start-${index}-${t.value}`} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label>End Time</Label>
                                                <Select value={segment.endTime} onValueChange={v => handleSegmentChange(index, 'endTime', v)}><SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>{timeOptions.map(t => <SelectItem key={`end-${index}-${t.value}`} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSegment(index)} disabled={timeSegments.length <= 1}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="link" onClick={addSegment}><PlusCircle className="mr-2 h-4 w-4"/> Add Another Time Slot</Button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save & Add Job</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
