
'use client';
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '@/lib/constants';
import { Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { MoreHorizontal } from 'lucide-react';

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
    isCompact?: boolean;
}

export const DraggableJob: React.FC<DraggableJobProps> = ({ job, children, onStatusChange, isCompact }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.JOB,
        item: { ...job },
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
    const startHour = new Date(job.schedule.start).getHours();
    const startMinute = new Date(job.schedule.start).getMinutes();
    const topPosition = ((startHour - 7) * 60) + startMinute;

    if (isCompact) {
        return (
            <div
                ref={drag}
                className="absolute inset-x-1"
                style={{
                    top: `${topPosition}px`,
                    height: `${durationMinutes}px`,
                    opacity: isDragging ? 0.5 : 1,
                }}
            >
                <div
                    className={cn(
                        "h-full w-full rounded p-1 text-[10px] cursor-grab active:cursor-grabbing overflow-hidden",
                        "text-white"
                    )}
                    style={{ backgroundColor: job.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                >
                    <p className="font-bold truncate">{job.title}</p>
                    <p className="truncate">{job.customerName}</p>
                </div>
            </div>
        );
    }

    // This is for the job cards on the daily view
    return (
        <div
            ref={drag}
            className="absolute left-2 right-2"
            style={{
                top: `${topPosition}px`,
                height: `${durationMinutes}px`,
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            "h-full w-full p-2 rounded-md border text-xs cursor-pointer overflow-hidden",
                            getStatusColor(job.status)
                        )}
                    >
                        <p className="font-bold truncate">{job.title}</p>
                        <p className="truncate">{job.customerName}</p>
                        <p className="truncate text-gray-600">{job.technicianName}</p>
                        <MoreHorizontal className="absolute top-1 right-1 h-4 w-4" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0">
                    <Command>
                        <CommandList>
                            <CommandGroup heading="Change Status">
                                <CommandItem onSelect={() => handleStatusChange('scheduled')}>Scheduled</CommandItem>
                                <CommandItem onSelect={() => handleStatusChange('in_progress')}>In Progress</CommandItem>
                                <CommandItem onSelect={() => handleStatusChange('complete')}>Complete</CommandItem>
                            </CommandGroup>
                             <CommandGroup heading="Actions">
                                <CommandItem onSelect={() => alert(`Opening details for ${job.title}`)}>Open Job Details</CommandItem>
                                <CommandItem onSelect={handleRemove} className="text-destructive">Remove from Schedule</CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};
