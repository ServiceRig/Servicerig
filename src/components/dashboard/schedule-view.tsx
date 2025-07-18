
'use client'
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job, Technician } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from '../ui/scroll-area';
import { DraggableJob } from './dnd/DraggableJob';
import { TimeSlot } from './dnd/TimeSlot';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format, addDays, startOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

const UnscheduledJobCard = ({ job }: { job: Job }) => (
    <DraggableJob job={job}>
        <Card className="mb-2 p-2 cursor-grab active:cursor-grabbing">
            <CardHeader className="p-1">
                <CardTitle className="text-sm font-bold">{job.title}</CardTitle>
                <CardDescription className="text-xs">{job.customerName}</CardDescription>
            </CardHeader>
            <CardContent className="p-1 text-xs text-muted-foreground">
                {job.details.serviceType}
            </CardContent>
        </Card>
    </DraggableJob>
);

const UnscheduledJobsPanel = ({ jobs }: { jobs: Job[] }) => (
    <Card className="w-full md:w-64 h-full flex flex-col">
        <CardHeader>
            <CardTitle>Unscheduled Jobs</CardTitle>
            <CardDescription>{jobs.length} jobs waiting</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                {jobs.length > 0 ? (
                    jobs.map(job => <UnscheduledJobCard key={job.id} job={job} />)
                ) : (
                    <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">
                        No unscheduled jobs.
                    </div>
                )}
            </ScrollArea>
        </CardContent>
    </Card>
);

const TimeAxis = () => (
    <div className="relative">
        {hours.map(hour => (
            <div key={hour} className="h-[60px] relative border-t border-dashed">
                <span className="absolute -top-2.5 left-1 text-xs text-muted-foreground bg-background px-1">
                    {hour % 12 === 0 ? 12 : hour % 12}:00 {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                </span>
            </div>
        ))}
    </div>
);


const DailyView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: Job[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const [selectedTech, setSelectedTech] = React.useState<string | 'all'>('all');
    
    const filteredJobs = jobs.filter(j => isSameDay(j.schedule.start, currentDate) && (selectedTech === 'all' || j.technicianId === selectedTech));
    const visibleTechnicians = selectedTech === 'all' ? technicians : technicians.filter(t => t.id === selectedTech);

    return (
        <div className="space-y-4">
             <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by technician..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex-grow grid grid-cols-[auto_1fr] gap-4">
                <div className="w-16"><TimeAxis /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visibleTechnicians.map(tech => (
                        <div key={tech.id}>
                            <h3 className="font-semibold text-center mb-2">{tech.name}</h3>
                            <div className="relative bg-muted/40 rounded-lg min-h-[calc(16*60px)]">
                                {hours.map(hour => (
                                    [0, 15, 30, 45].map(minute => {
                                        const slotTime = new Date(currentDate);
                                        slotTime.setHours(hour, minute, 0, 0);
                                        return (
                                            <TimeSlot 
                                                key={`${hour}-${minute}`} 
                                                technicianId={tech.id} 
                                                startTime={slotTime} 
                                                onDrop={onJobDrop} 
                                            />
                                        )
                                    })
                                ))}
                                {filteredJobs.filter(j => j.technicianId === tech.id).map(job => (
                                    <DraggableJob key={job.id} job={job} onStatusChange={onJobStatusChange} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const WeeklyView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: any[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const weekStartsOn = 0; // Sunday
    const weekStart = startOfWeek(currentDate, { weekStartsOn });
    const days = Array.from({length: 7}).map((_, i) => addDays(weekStart, i));
    
    const jobsThisWeek = jobs.filter(j => isWithinInterval(j.schedule.start, { start: weekStart, end: addDays(weekStart, 6) }));
    
    return (
    <div className="flex-grow grid grid-cols-[auto_1fr] gap-4">
        <div className="w-16"><TimeAxis/></div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="grid grid-cols-7 gap-px w-max bg-border">
                {days.map((day, dayIndex) => {
                    return (
                        <div key={day.toISOString()} className="w-48 bg-background">
                            <h3 className="font-semibold text-center my-2">{format(day, 'EEE')} {format(day, 'd')}</h3>
                            <div className="relative min-h-[calc(16*60px)]">
                                 <div className="absolute inset-0 border-r border-border"></div>
                                 {jobsThisWeek.filter(j => isSameDay(j.schedule.start, day)).map(job => (
                                     <DraggableJob key={job.id} job={job} onStatusChange={onJobStatusChange} />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="h-4"></div>
        </ScrollArea>
    </div>
    )
};

const TechnicianView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: any[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const weekStartsOn = 0; // Sunday
    const weekStart = startOfWeek(currentDate, { weekStartsOn });
    const days = Array.from({length: 7}).map((_, i) => addDays(weekStart, i));
    
    const jobsThisWeek = jobs.filter(j => isWithinInterval(j.schedule.start, { start: weekStart, end: addDays(weekStart, 6) }));
    
    return (
     <div className="flex-grow grid grid-cols-[auto_1fr] gap-4">
        <div className="w-40 space-y-2">
            <div className="h-8"></div>
             {technicians.map(tech => (
                <div key={tech.id} className="h-[60px] flex items-center justify-center font-semibold text-center border-t border-dashed p-2">{tech.name}</div>
            ))}
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="grid grid-rows-[auto_1fr] w-max">
                 <div className="grid grid-cols-7 bg-border gap-px">
                     {days.map(day => <h3 key={day.toISOString()} className="font-semibold text-center my-2 bg-background w-48">{format(day, 'EEE')} {format(day, 'd')}</h3>)}
                 </div>
                 <div className="bg-border grid grid-cols-7 gap-px">
                     {days.map((day) => (
                         <div key={day.toISOString()} className="bg-background w-48">
                            {technicians.map(tech => (
                                <div key={tech.id} className="relative h-[60px] border-t border-dashed">
                                     {jobsThisWeek.filter(j => j.technicianId === tech.id && isSameDay(j.schedule.start, day)).map(job => (
                                         <DraggableJob key={job.id} job={job} onStatusChange={onJobStatusChange} isCompact={true} />
                                    ))}
                                </div>
                            ))}
                         </div>
                     ))}
                 </div>
            </div>
             <div className="h-4"></div>
        </ScrollArea>
     </div>
    )
};

interface ScheduleViewProps {
    jobs: Job[];
    unscheduledJobs: Job[];
    technicians: Technician[];
    onJobDrop: (jobId: string, technicianId: string, startTime: Date) => void;
    onJobStatusChange: (jobId: string, newStatus: Job['status']) => void;
    currentDate: Date;
    onCurrentDateChange: (date: Date) => void;
    onPrevious: () => void;
    onNext: () => void;
    activeView: string;
    onActiveViewChange: (view: string) => void;
}


export function ScheduleView({ 
    jobs, 
    unscheduledJobs, 
    technicians, 
    onJobDrop, 
    onJobStatusChange, 
    currentDate, 
    onCurrentDateChange,
    onPrevious,
    onNext,
    activeView,
    onActiveViewChange,
}: ScheduleViewProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            <UnscheduledJobsPanel jobs={unscheduledJobs} />
            <Card className="flex-grow h-full">
                <Tabs value={activeView} onValueChange={onActiveViewChange} className="h-full flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <CardTitle>Schedule</CardTitle>
                                <CardDescription>Drag, drop, and resize jobs to schedule your team.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={onPrevious}><ChevronLeft className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Previous</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !currentDate && "text-muted-foreground"
                                        )}
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
                                            <Button variant="outline" size="icon" onClick={onNext}><ChevronRight className="h-4 w-4" /></Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Next</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <TabsList>
                            <TabsTrigger value="day">Daily</TabsTrigger>
                            <TabsTrigger value="week">Weekly</TabsTrigger>
                            <TabsTrigger value="technician">By Technician</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        <TabsContent value="day" className="h-full">
                            <DailyView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate}/>
                        </TabsContent>
                        <TabsContent value="week">
                             <WeeklyView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate} />
                        </TabsContent>
                        <TabsContent value="technician">
                            <TechnicianView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate} />
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}
