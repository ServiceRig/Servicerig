

'use client';
import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { Job, GoogleCalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList }from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, User, MapPin, Calendar, Clock, Wrench, Link as LinkIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleJobDialog } from '../scheduling/ScheduleJobDialog';

const getStatusColor = (status?: Job['status']) => {
    if (!status) return 'bg-blue-200 border-blue-400 text-blue-800'; // Default for Google Events
    switch (status) {
        case 'scheduled': return 'bg-blue-200 border-blue-400 text-blue-800';
        case 'in_progress':
        case 'started':
             return 'bg-yellow-200 border-yellow-400 text-yellow-800';
        case 'complete': return 'bg-green-200 border-green-400 text-green-800';
        case 'unscheduled':
        case 'on_hold':
        case 'awaiting_parts':
             return 'bg-gray-200 border-gray-400 text-gray-800';
        case 'invoiced':
             return 'bg-purple-200 border-purple-400 text-purple-800';
        default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
};

type DraggableItem = (Job & { isGhost?: boolean; originalId: string; type: 'job' }) | (GoogleCalendarEvent & { type: 'google_event' });


interface DraggableJobProps {
    item: DraggableItem;
    children?: React.ReactNode;
    onStatusChange?: (jobId: string, status: Job['status']) => void;
    onJobDrop?: (jobId: string, technicianId: string, startTime: Date) => void;
    onJobCreated?: (newJob: Job) => void;
    isCompact?: boolean;
    startHour?: number;
}

const InfoRow = ({ icon: Icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-4 w-4 text-muted-foreground mt-1" />
        <div className="flex-grow">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium">{children}</div>
        </div>
    </div>
);

const allStatuses: Job['status'][] = ['unscheduled', 'scheduled', 'started', 'on_hold', 'awaiting_parts', 'in_progress', 'complete', 'invoiced'];

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}


export const DraggableJob: React.FC<DraggableJobProps> = ({ item, children, onStatusChange, isCompact, startHour = 7, onJobDrop, onJobCreated }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.JOB,
        item: { id: item.type === 'job' ? item.originalId : item.eventId }, // Use the original ID for the drag item
        canDrag: item.type === 'job' && !item.isGhost,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (item.type !== 'job') return;
        const isTimerActive = item.status === 'started' || item.status === 'in_progress';
        setIsActive(isTimerActive);
        
        let interval: NodeJS.Timeout | null = null;
        if (isTimerActive) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };

    }, [item]);

    const handleStatusChange = (newStatus: Job['status']) => {
        if (item.type === 'job' && onStatusChange) {
            onStatusChange(item.originalId, newStatus);
        }
    }
    
    if (children) {
        return (
            <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
                {children}
            </div>
        );
    }
    
    const durationMinutes = (new Date(item.end).getTime() - new Date(item.start).getTime()) / (1000 * 60);
    const jobStartHour = new Date(item.start).getHours();
    const jobStartMinute = new Date(item.start).getMinutes();
    
    const topPosition = ((jobStartHour - startHour) * 60) + jobStartMinute;

    const isGoogleEvent = item.type === 'google_event';

    const jobTrigger = isCompact ? (
        <div
            className={cn(
                "h-full w-full rounded p-1 text-[10px] cursor-pointer overflow-hidden",
                "text-white",
                item.type === 'job' && item.isGhost && "opacity-60",
                isGoogleEvent && "bg-blue-400 border-blue-500 opacity-80"
            )}
            style={{ backgroundColor: item.type === 'job' ? item.color : undefined, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
            <p className="font-bold truncate">{isGoogleEvent ? item.summary : item.title}</p>
            <p className="truncate">{isGoogleEvent ? item.createdBy : item.customerName}</p>
        </div>
    ) : (
         <div
            className={cn(
                "h-full w-full p-2 rounded-md border text-xs cursor-pointer overflow-hidden",
                getStatusColor(item.type === 'job' ? item.status : undefined),
                item.type === 'job' && item.isGhost && "opacity-60",
                isGoogleEvent && "bg-blue-300 border-blue-500 opacity-90"
            )}
             style={{ backgroundColor: item.type === 'job' ? item.color : undefined, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
            <p className="font-bold truncate text-white">{isGoogleEvent ? item.summary : item.title}</p>
            <p className="truncate text-white">{isGoogleEvent ? item.createdBy : item.customerName}</p>
            <p className="truncate text-white/80">{item.type === 'job' ? item.technicianName : 'Google Event'}</p>
        </div>
    );
    
    const initialJobDataFromEvent = item.type === 'google_event' ? {
        title: item.summary,
        description: item.description,
        schedule: {
            start: new Date(item.start),
            end: new Date(item.end),
        }
    } : undefined;


    return (
        <div
            ref={drag}
            className={cn("absolute z-10", isCompact ? "inset-x-1" : "left-2 right-2", item.type === 'job' && item.isGhost ? 'pointer-events-none' : 'cursor-grab')}
            style={{
                top: `${topPosition}px`,
                height: `${durationMinutes}px`,
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <Dialog>
                <DialogTrigger asChild>
                    {jobTrigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isGoogleEvent ? item.summary : item.title}</DialogTitle>
                         {item.type === 'job' && (
                            <DialogDescription>
                                Job ID: {item.originalId.toUpperCase()}
                            </DialogDescription>
                         )}
                         {isGoogleEvent && (
                              <DialogDescription className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" /> Synced from Google Calendar
                            </DialogDescription>
                         )}
                    </DialogHeader>
                    {item.type === 'job' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Status</label>
                                     <Select value={item.status} onValueChange={(value) => handleStatusChange(value as Job['status'])} disabled={item.isGhost}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <label className="text-sm text-muted-foreground">Job Timer</label>
                                    <div className="text-2xl font-mono font-bold p-2 border rounded-md text-center">
                                        {formatDuration(elapsedTime)}
                                    </div>
                                </div>
                            </div>
                            <InfoRow icon={User} label="Customer">{item.customerName}</InfoRow>
                            <InfoRow icon={MapPin} label="Address">123 Main St, Anytown, USA</InfoRow>
                            <InfoRow icon={Wrench} label="Service Type">{item.details.serviceType}</InfoRow>
                            <InfoRow icon={Calendar} label="Date">{format(new Date(item.schedule.start), 'eeee, MMMM d, yyyy')}</InfoRow>
                            <InfoRow icon={Clock} label="Time">{format(new Date(item.schedule.start), 'h:mm a')} - {format(new Date(item.schedule.end), 'h:mm a')}</InfoRow>
                            <InfoRow icon={User} label="Technician">{item.technicianName || 'Unassigned'}</InfoRow>
                            <div><p className="text-sm text-muted-foreground">Description</p><p className="font-medium whitespace-pre-wrap">{item.description}</p></div>
                             <div className="mt-6 flex justify-end gap-2">
                                <Button asChild variant="outline"><Link href={`/dashboard/jobs/${item.originalId}`}>View Full Job Details</Link></Button>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <InfoRow icon={User} label="Created By">{item.createdBy}</InfoRow>
                            <InfoRow icon={Calendar} label="Date">{format(new Date(item.start), 'eeee, MMMM d, yyyy')}</InfoRow>
                            <InfoRow icon={Clock} label="Time">{format(new Date(item.start), 'h:mm a')} - {format(new Date(item.end), 'h:mm a')}</InfoRow>
                            <div><p className="text-sm text-muted-foreground">Description</p><p className="font-medium whitespace-pre-wrap">{item.description || 'No description provided.'}</p></div>
                             <div className="mt-6 flex justify-end gap-2">
                                <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" /> Open in Google Calendar</Button>
                                {onJobCreated && (
                                     <ScheduleJobDialog
                                        onJobCreated={onJobCreated}
                                        initialJobData={initialJobDataFromEvent}
                                        triggerButton={
                                            <Button><Edit className="mr-2 h-4 w-4" /> Convert to Job</Button>
                                        }
                                     />
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
