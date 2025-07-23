
'use client';
import React, from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList }from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, User, MapPin, Calendar, Clock, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const getStatusColor = (status: Job['status']) => {
    switch (status) {
        case 'scheduled': return 'bg-blue-200 border-blue-400 text-blue-800';
        case 'in_progress': return 'bg-yellow-200 border-yellow-400 text-yellow-800';
        case 'complete': return 'bg-green-200 border-green-400 text-green-800';
        case 'unscheduled': return 'bg-gray-200 border-gray-400 text-gray-800';
        default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
};

interface DraggableJobProps {
    job: Job;
    children?: React.ReactNode;
    onStatusChange?: (jobId: string, status: Job['status']) => void;
    onJobDrop?: (jobId: string, technicianId: string, startTime: Date) => void;
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


export const DraggableJob: React.FC<DraggableJobProps> = ({ job, children, onStatusChange, isCompact, startHour = 7, onJobDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.JOB,
        item: { id: job.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const handleStatusChange = (status: Job['status']) => {
        if (onStatusChange) {
            onStatusChange(job.id, status);
        }
    }
    
    const handleRemove = () => {
        if (onStatusChange) {
            onStatusChange(job.id, 'unscheduled');
        }
    }

    // This is for the unscheduled job cards in the side panel
    if (children && !isCompact) {
        return (
            <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
                {children}
            </div>
        );
    }
    
    const durationMinutes = (new Date(job.schedule.end).getTime() - new Date(job.schedule.start).getTime()) / (1000 * 60);
    const jobStartHour = new Date(job.schedule.start).getHours();
    const jobStartMinute = new Date(job.schedule.start).getMinutes();
    const topPosition = ((jobStartHour - startHour) * 60) + jobStartMinute;

    const jobTrigger = isCompact ? (
        <div
            className={cn(
                "h-full w-full rounded p-1 text-[10px] cursor-pointer overflow-hidden",
                "text-white"
            )}
            style={{ backgroundColor: job.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
            <p className="font-bold truncate">{job.title}</p>
            <p className="truncate">{job.customerName}</p>
        </div>
    ) : (
         <div
            className={cn(
                "h-full w-full p-2 rounded-md border text-xs cursor-pointer overflow-hidden",
                getStatusColor(job.status)
            )}
             style={{ backgroundColor: job.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
            <p className="font-bold truncate text-white">{job.title}</p>
            <p className="truncate text-white">{job.customerName}</p>
            <p className="truncate text-white/80">{job.technicianName}</p>
        </div>
    );

    return (
        <div
            ref={drag}
            className={cn("absolute z-10", isCompact ? "inset-x-1" : "left-2 right-2")}
            style={{
                top: `${topPosition}px`,
                height: `${durationMinutes}px`,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab'
            }}
        >
            <Dialog>
                <DialogTrigger asChild>
                    {jobTrigger}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{job.title}</DialogTitle>
                        <DialogDescription>
                            Job ID: {job.id.toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <InfoRow icon={User} label="Customer">
                            {job.customerName}
                        </InfoRow>
                         <InfoRow icon={MapPin} label="Address">
                            {/* Placeholder for customer address */}
                            123 Main St, Anytown, USA
                        </InfoRow>
                        <InfoRow icon={Wrench} label="Service Type">
                            {job.details.serviceType}
                        </InfoRow>
                        <InfoRow icon={Calendar} label="Date">
                           {format(new Date(job.schedule.start), 'eeee, MMMM d, yyyy')}
                        </InfoRow>
                         <InfoRow icon={Clock} label="Time">
                            {format(new Date(job.schedule.start), 'h:mm a')} - {format(new Date(job.schedule.end), 'h:mm a')}
                        </InfoRow>
                        <InfoRow icon={User} label="Technician">
                            {job.technicianName || 'Unassigned'}
                        </InfoRow>
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="font-medium whitespace-pre-wrap">{job.description}</p>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/dashboard/jobs/${job.id}`}>View Full Job Details</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
