
'use client';
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job, Technician, GoogleCalendarEvent, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from '@/components/ui/scroll-area';
import { DraggableJob } from '../dnd/DraggableJob';
import { TimeSlot } from '../dnd/TimeSlot';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useScheduleView } from '@/hooks/use-schedule-view';
import { useRole } from '@/hooks/use-role';
import { ScheduleJobDialog } from './ScheduleJobDialog';
import { useIsDraggingTechnician } from './DragIndicator';
import { mockData } from '@/lib/mock-data';

export type SchedulableItem = {
    id: string;
    originalId: string;
    title: string;
    start: Date;
    end: Date;
    type: 'job' | 'google_event';
    customerName?: string;
    technicianId?: string;
    technicianName?: string;
    color?: string;
    isGhost?: boolean;
    status?: Job['status'];
    description?: string;
    details?: Job['details'];
    createdBy?: string;
    matchedTechnicianId?: string;
    originalData?: any;
};

interface ScheduleViewProps {
    items: SchedulableItem[];
    technicians: Technician[];
    onJobDrop: (item: {id: string, type: 'job' | 'google_event', originalData: SchedulableItem}, newTechnicianId: string, newStartTime: Date) => void;
    onDragHover: (item: any, techId: string, time: Date) => void;
    onJobStatusChange: (jobId: string, newStatus: Job['status']) => void;
    onJobCreated: (newJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
    currentDate: Date;
    onCurrentDateChange: (date: Date) => void;
    onPrevious: () => void;
    onNext: () => void;
    activeView: string;
    onActiveViewChange: (view: string) => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
}

const TimeAxis = ({ startHour, endHour }: { startHour: number, endHour: number }) => {
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
    return (
        <div className="relative w-20 text-right pr-2 mt-[78px]">
            {hours.map(hour => (
                <div key={hour} className="h-[60px] relative">
                    <span className="absolute -top-3 right-2 text-xs text-muted-foreground bg-background px-1">
                        {hour % 12 === 0 ? 12 : hour % 12}:00 {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                    </span>
                </div>
            ))}
        </div>
    );
};

const TechnicianColumn = ({ tech, items, currentDate, startHour, endHour, onJobDrop, onDragHover, onJobStatusChange }: { tech: Technician, items: SchedulableItem[], currentDate: Date, startHour: number, endHour: number, onJobDrop: any, onDragHover: any, onJobStatusChange: any }) => {
    const isDraggingOver = useIsDraggingTechnician(tech.id);
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
    
    return (
        <div key={tech.id} className={cn("min-w-[200px] transition-all", isDraggingOver && 'bg-accent/20')}>
            <h3 className="font-semibold text-center mb-2" style={{ color: tech.color }}>
                {tech.name}
            </h3>
            <div className="relative bg-muted/40 rounded-lg" style={{ minHeight: `${hours.length * 60}px`}}>
                {hours.flatMap(hour => (
                    [0, 15, 30, 45].map(minute => {
                        const slotTime = new Date(currentDate);
                        slotTime.setHours(hour, minute, 0, 0);
                        return (
                            <TimeSlot 
                                key={`${hour}-${minute}`} 
                                technicianId={tech.id} 
                                startTime={slotTime}
                                onDrop={onJobDrop}
                                onHover={onDragHover}
                                startHour={startHour}
                            />
                        )
                    })
                ))}
                {hours.slice(1).map(h => (
                    <div 
                        key={h} 
                        className="h-[60px] border-t border-dashed border-gray-300" 
                        style={{ top: `${(h-startHour)*60}px`, position: 'absolute', width: '100%'}} 
                    />
                ))}
                {items
                    .filter(item => ((item.type === 'job' && item.technicianId === tech.id) || (item.type === 'google_event' && item.matchedTechnicianId === tech.id)) && !item.originalData.isGhost)
                    .map(item => (
                        <DraggableJob 
                            key={`daily-${item.id}`} 
                            item={item} 
                            onStatusChange={onJobStatusChange} 
                            startHour={startHour}
                        />
                    ))}
                 {items
                    .filter(item => item.isGhost && item.technicianId === tech.id)
                    .map(item => (
                        <DraggableJob 
                            key={`daily-ghost-${item.id}`} 
                            item={item} 
                            isGhost
                            startHour={startHour}
                        />
                    ))}
            </div>
        </div>
    )
}

const DailyView = ({ items, technicians, onJobDrop, onDragHover, onJobStatusChange, currentDate, startHour, endHour }: any) => {
    const [selectedTech, setSelectedTech] = React.useState<string | 'all'>('all');
    
    const filteredItems = items.filter((item: SchedulableItem) => {
        if (!isSameDay(new Date(item.start), currentDate)) return false;
        if (selectedTech === 'all') return true;
        if (item.type === 'job') return item.technicianId === selectedTech || (item.technicianId === 'unassigned' && selectedTech === 'unassigned');
        if (item.type === 'google_event') return item.matchedTechnicianId === selectedTech;
        return false;
    });

    const visibleTechnicians = selectedTech === 'all' 
        ? [...technicians, { id: 'unassigned', name: 'Unassigned', color: '#888888', role: UserRole.Technician }] 
        : technicians.filter((t: Technician) => t.id === selectedTech);

    return (
        <div className="flex flex-col h-full">
            <div className="pb-4">
                <Select value={selectedTech} onValueChange={setSelectedTech}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by technician..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Technicians</SelectItem>
                        {technicians.map((tech: Technician) => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                        ))}
                         <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea className="flex-grow">
                <div className="flex">
                    <TimeAxis startHour={startHour} endHour={endHour} />
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visibleTechnicians.map((tech: Technician) => (
                           <TechnicianColumn
                                key={tech.id}
                                tech={tech}
                                items={filteredItems}
                                currentDate={currentDate}
                                startHour={startHour}
                                endHour={endHour}
                                onJobDrop={onJobDrop}
                                onDragHover={onDragHover}
                                onJobStatusChange={onJobStatusChange}
                           />
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

const WeeklyView = ({ items, technicians, onJobDrop, onDragHover, onJobStatusChange, currentDate, startHour, endHour }: any) => {
    const { isFitToScreen } = useScheduleView();
    const weekStartsOn = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartsOn, i));
    const allTechsAndUnassigned = [...technicians, { id: 'unassigned', name: 'Unassigned', color: '#888888', role: UserRole.Technician }];
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
    const gridOffset = 78;

    return (
        <ScrollArea className="h-full" viewportClassName="h-full">
            <div className="flex h-full">
                <TimeAxis startHour={startHour} endHour={endHour}/>
                <div className={cn("grid grid-cols-7 relative flex-grow", isFitToScreen ? "w-full" : "min-w-[2000px]")}>
                    {weekDays.map((day) => {
                        return (
                            <div key={day.toISOString()} className="border-l flex flex-col">
                                <div className="text-center font-semibold py-2 border-b sticky top-0 bg-background z-20">
                                    {format(day, 'EEE')} <span className="text-muted-foreground">{format(day, 'd')}</span>
                                </div>
                                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${allTechsAndUnassigned.length}, 1fr)` }}>
                                    {allTechsAndUnassigned.map((tech, techIndex) => {
                                        const isDraggingOverTech = useIsDraggingTechnician(tech.id);
                                        const itemsForThisTechAndDay = items.filter((item: SchedulableItem) => 
                                            ((item.type === 'job' && item.technicianId === tech.id) || 
                                             (item.type === 'google_event' && item.matchedTechnicianId === tech.id)) && 
                                            isSameDay(new Date(item.start), day) && !item.isGhost
                                        );
                                        
                                        const ghostItemForThisCell = items.find((item: SchedulableItem) => 
                                            item.isGhost && 
                                            item.technicianId === tech.id && 
                                            isSameDay(new Date(item.start), day)
                                        );

                                        return (
                                            <div key={tech.id} className={cn("relative h-full transition-colors", techIndex > 0 && "border-l border-dashed", isDraggingOverTech && 'bg-accent/20')}>
                                                <div className="sticky top-[49px] bg-background z-10 text-center text-xs py-1 border-b font-semibold" style={{ color: tech.color }}>
                                                    {getInitials(tech.name)}
                                                </div>
                                                <div className="relative" style={{ height: `${hours.length * 60}px`}}>
                                                    {hours.flatMap(hour =>
                                                        [0, 15, 30, 45].map(minute => {
                                                            const slotTime = new Date(day);
                                                            slotTime.setHours(hour, minute, 0, 0);
                                                            return (
                                                                <TimeSlot
                                                                    key={`${day.toISOString()}-${hour}-${minute}`}
                                                                    technicianId={tech.id}
                                                                    startTime={slotTime}
                                                                    onDrop={onJobDrop}
                                                                    onHover={onDragHover}
                                                                    startHour={startHour}
                                                                />
                                                            );
                                                        })
                                                    )}
                                                    {itemsForThisTechAndDay.map((item: SchedulableItem) => {
                                                        return (
                                                            <DraggableJob 
                                                                key={`weekly-${item.id}-${day.toISOString()}`} 
                                                                item={item} 
                                                                onStatusChange={onJobStatusChange} 
                                                                isCompact 
                                                                startHour={startHour} 
                                                            />
                                                        );
                                                    })}
                                                    {ghostItemForThisCell && (
                                                         <DraggableJob 
                                                            key={`weekly-ghost-${ghostItemForThisCell.id}`} 
                                                            item={ghostItemForThisCell} 
                                                            isGhost
                                                            isCompact
                                                            startHour={startHour} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    <div className="absolute top-0 left-0 right-0" style={{ height: `${gridOffset + (hours.length * 60)}px`, pointerEvents: 'none' }}>
                        {hours.slice(1).map(h => (
                            <div 
                                key={h} 
                                className="h-[60px] border-t border-dashed border-gray-300"
                                style={{ top: `${gridOffset + (h - startHour) * 60}px`, position: 'absolute', width: '100%' }} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};

export function ScheduleView({
  items,
  technicians,
  onJobDrop,
  onDragHover,
  onJobStatusChange,
  onJobCreated,
  currentDate,
  onCurrentDateChange,
  onPrevious,
  onNext,
  activeView,
  onActiveViewChange,
}: ScheduleViewProps) {
    const { role } = useRole();
    const { startHour, endHour } = mockData.scheduleSettings;
    
    return (
        <Card className="h-full flex flex-col">
            <Tabs value={activeView} onValueChange={onActiveViewChange} className="h-full flex flex-col">
                <CardHeader className="flex-row items-center justify-between border-b">
                    <div className="flex items-center gap-4">
                        <div>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>Drag, drop, and resize jobs to schedule your team.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={onPrevious}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Previous</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-[240px] justify-start text-left font-normal", !currentDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate}
                                        onSelect={(date) => date && onCurrentDateChange(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={onNext}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Next</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                            <ScheduleJobDialog onJobCreated={onJobCreated as any} />
                        <TabsList>
                            <TabsTrigger value="day">Daily</TabsTrigger>
                            <TabsTrigger value="week">Weekly</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto p-0">
                    <TabsContent value="day" className="h-full mt-0 p-4">
                        <DailyView 
                            items={items} 
                            technicians={technicians} 
                            onJobDrop={onJobDrop}
                            onDragHover={onDragHover}
                            onJobStatusChange={onJobStatusChange}
                            currentDate={currentDate} 
                            startHour={startHour} 
                            endHour={endHour}
                        />
                    </TabsContent>
                    <TabsContent value="week" className="h-full mt-0">
                        <WeeklyView 
                            items={items} 
                            technicians={technicians} 
                            onJobDrop={onJobDrop}
                            onDragHover={onDragHover} 
                            onJobStatusChange={onJobStatusChange}
                            currentDate={currentDate} 
                            startHour={startHour} 
                            endHour={endHour}
                        />
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
    );
}
