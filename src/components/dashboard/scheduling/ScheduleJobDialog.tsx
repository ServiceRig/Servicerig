
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { PlusCircle, UserPlus, Calendar as CalendarIcon, X } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import type { Customer, Equipment, Estimate, Job, Technician } from '@/lib/types';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { addJob } from '@/lib/firestore/jobs';

const timeOptions = Array.from({ length: 48 }, (_, i) => {
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


export function ScheduleJobDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerEquipment, setCustomerEquipment] = useState<Equipment[]>([]);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
    const [trade, setTrade] = useState<'Plumbing' | 'HVAC' | 'Electrical' | 'Other'>('Other');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [primaryTechnicianId, setPrimaryTechnicianId] = useState<string>('');
    const [additionalTechnicians, setAdditionalTechnicians] = useState<Set<string>>(new Set());
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('10:00');
    const [arrivalWindow, setArrivalWindow] = useState<string>('');
    const [isUnscheduled, setIsUnscheduled] = useState(false);

    // Data from mock
    const allCustomers = mockData.customers as Customer[];
    const allTechnicians = mockData.technicians as Technician[];
    const allEquipment = mockData.equipment as Equipment[];

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

    const resetForm = () => {
        setSelectedCustomer(null);
        setTrade('Other');
        setCategory('');
        setDescription('');
        setPrimaryTechnicianId('');
        setAdditionalTechnicians(new Set());
        setIsMultiDay(false);
        setStartDate(new Date());
        setStartTime('08:00');
        setEndTime('10:00');
        setArrivalWindow('');
        setIsUnscheduled(false);
    };
    
    const handleSave = async () => {
        if (!selectedCustomer || !trade || !description || !primaryTechnicianId) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all required fields.' });
            return;
        }

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const finalStartDate = setMinutes(setHours(startDate!, startH), startM);
        const finalEndDate = setMinutes(setHours(startDate!, endH), endM);

        const newJob: Job = {
            id: `job_${Date.now()}`,
            customerId: selectedCustomer.id,
            technicianId: primaryTechnicianId,
            additionalTechnicians: Array.from(additionalTechnicians),
            equipmentId: selectedEquipmentId,
            status: isUnscheduled ? 'unscheduled' : 'scheduled',
            title: `${trade} Service for ${selectedCustomer.primaryContact.name}`,
            description,
            details: {
                serviceType: trade,
                trade,
                category,
            },
            schedule: {
                start: finalStartDate,
                end: finalEndDate,
                arrivalWindow: isUnscheduled ? undefined : arrivalWindow,
                multiDay: isMultiDay,
                unscheduled: isUnscheduled,
            },
            duration: (finalEndDate.getTime() - finalStartDate.getTime()) / (1000 * 60),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            await addJob(newJob);
            toast({ title: 'Job Scheduled', description: `Job for ${selectedCustomer.primaryContact.name} has been created.` });
            resetForm();
            setIsOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule job.' });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Job
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Schedule a New Job</DialogTitle>
                    <DialogDescription>Fill in the details to add a new job to the schedule.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
                    <div className="space-y-6">
                        {/* Customer Section */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-4">Customer</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Select Customer</Label>
                                     <Select onValueChange={handleSelectCustomer}>
                                        <SelectTrigger><SelectValue placeholder="Search by name, phone..." /></SelectTrigger>
                                        <SelectContent>
                                            {allCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.primaryContact.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="outline" className="self-end"><UserPlus className="mr-2 h-4 w-4"/> New Customer</Button>

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
                        </div>

                        {/* Job Details Section */}
                         <div className="p-4 border rounded-lg">
                             <h3 className="font-semibold mb-4">Job Details</h3>
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
                                   <div className="space-y-2 md:col-span-2">
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
                                              <Button key={t.id} variant={additionalTechnicians.has(t.id) ? 'default' : 'outline'} size="sm" onClick={() => handleMultiTechSelect(t.id)}>{t.name}</Button>
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
                            <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", isUnscheduled && "opacity-50 pointer-events-none")}>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
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
                                 <div className="space-y-2">
                                    <Label>Arrival Window</Label>
                                    <Select value={arrivalWindow} onValueChange={setArrivalWindow}><SelectTrigger><SelectValue placeholder="Select window"/></SelectTrigger>
                                        <SelectContent>{arrivalWindows.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="flex items-center space-x-2 mt-4">
                                    <Switch id="multi-day" checked={isMultiDay} onCheckedChange={setIsMultiDay} />
                                    <Label htmlFor="multi-day">Multi-Day Job</Label>
                                </div>
                            </div>
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

