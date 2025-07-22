
'use client';
import React from 'react';
import Link from 'next/link';
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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Maximize, PlusCircle } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useScheduleView } from '@/app/dashboard/scheduling/page';
import { useRole } from '@/hooks/use-role';
import { ScheduleJobDialog } from './scheduling/ScheduleJobDialog';

interface ScheduleViewProps {
    jobs: Job[];
    unscheduledJobs: Job[];
    technicians: Technician[];
    onJobDrop: (jobId: string, technicianId: string, startTime: Date) => void;
    onJobStatusChange: (jobId: string, status: Job['status']) => void;
    currentDate: Date;
    onCurrentDateChange: (date: Date) => void;
    onPrevious: () => void;
    onNext: () => void;
    activeView: string;
    onActiveViewChange: (view: string) => void;
}

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

const UnscheduledJobsPanel = ({ jobs, technicians }: { jobs: Job[], technicians: Technician[] }) => {
    const { role } = useRole();
    const getHref = (path: string) => {
        return role ? `${path}?role=${role}` : path;
    };
    
    return (
        <Card className="w-full flex-grow flex flex-col">
            <CardHeader>
                <CardTitle>Unscheduled Jobs</CardTitle>
                <CardDescription>{jobs.length} jobs waiting</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
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
};


const TimeAxis = () => (
    <div className="relative w-16 text-right pr-2">
        {hours.map(hour => (
            <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground bg-background px-1">
                    {hour % 12 === 0 ? 12 : hour % 12}:00 {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                </span>
            </div>
        ))}
    </div>
);


const DailyView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: Job[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const [selectedTech, setSelectedTech] = React.useState<string | 'all'>('all');
    
    const filteredJobs = jobs.filter(j => 
        isSameDay(j.schedule.start, currentDate) && 
        (selectedTech === 'all' || j.technicianId === selectedTech)
    );
    
    const visibleTechnicians = selectedTech === 'all' ? technicians : technicians.filter(t => t.id === selectedTech);

    return (
        <div className="flex flex-col h-full">
            <div className="pb-4">
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
            </div>
            <ScrollArea className="flex-grow">
                 <div className="flex">
                    <TimeAxis />
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {visibleTechnicians.map(tech => (
                            <div key={tech.id} className="min-w-[200px]">
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
                                    {hours.map(h => <div key={h} className="h-[60px] border-t border-dashed border-gray-300" />)}
                                    {filteredJobs.filter(j => j.technicianId === tech.id).map(job => (
                                        <DraggableJob key={job.id} job={job} onStatusChange={onJobStatusChange} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

const WeeklyView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: Job[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const { isFitToScreen } = useScheduleView();
    const weekStartsOn = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartsOn, i));

    return (
         <div className="flex h-full">
            <TimeAxis />
            <ScrollArea className="flex-grow" viewportClassName="h-full">
                <div className={cn("grid grid-cols-7 h-full", isFitToScreen ? "w-full" : "min-w-[1400px]")}>
                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="border-l flex flex-col">
                            <div className="text-center font-semibold py-2 border-b sticky top-0 bg-background z-10">
                                {format(day, 'EEE')} <span className="text-muted-foreground">{format(day, 'd')}</span>
                            </div>
                            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${technicians.length}, minmax(0, 1fr))`}}>
                                {technicians.map((tech, techIndex) => (
                                    <div key={tech.id} className={cn("relative h-full", techIndex > 0 && "border-l border-dashed")}>
                                        {/* Apply tech-specific background color */}
                                        <div className="absolute inset-0" style={{ backgroundColor: tech.color || 'transparent', opacity: 0.1 }}></div>
                                        
                                        {/* Time Slots for dropping */}
                                        {hours.map(hour => (
                                            [0, 15, 30, 45].map(minute => {
                                                const slotTime = new Date(day);
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
                                        
                                        {/* Horizontal time lines */}
                                        {hours.map(h => <div key={h} style={{top: `${(h-7)*60}px`}} className="absolute w-full h-[60px] border-t border-dashed border-gray-300" />)}
                                        
                                        {/* Render jobs for this tech on this day */}
                                        {jobs.filter(job => job.technicianId === tech.id && isSameDay(new Date(job.schedule.start), day))
                                            .map(job => {
                                                const durationMinutes = (new Date(job.schedule.end).getTime() - new Date(job.schedule.start).getTime()) / (1000 * 60);
                                                const topPosition = (new Date(job.schedule.start).getHours() - 7 + new Date(job.schedule.start).getMinutes() / 60) * 60;
                                                return (
                                                    <div
                                                        key={job.id}
                                                        className="absolute w-full"
                                                        style={{
                                                            top: `${topPosition}px`,
                                                            height: `${durationMinutes}px`,
                                                        }}
                                                    >
                                                        <DraggableJob job={job} onStatusChange={onJobStatusChange} isCompact />
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

const TechnicianView = ({ jobs, technicians, onJobDrop, onJobStatusChange, currentDate }: { jobs: Job[], technicians: Technician[], onJobDrop: (jobId: string, techId: string, startTime: Date) => void, onJobStatusChange: (jobId: string, status: Job['status']) => void, currentDate: Date }) => {
    const weekStartsOn = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStartsOn, i));

    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-40 px-2 py-2 font-semibold border-r">Technician</div>
                 <div className="flex-grow grid grid-cols-7">
                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="text-center font-semibold py-2 border-l">
                            {format(day, 'EEE')} <span className="text-muted-foreground">{format(day, 'd')}</span>
                        </div>
                    ))}
                </div>
            </div>
            <ScrollArea className="flex-grow pr-4" viewportClassName="h-full">
                {technicians.map(tech => (
                    <div key={tech.id} className="flex border-b">
                        <div className="w-40 px-2 py-2 font-semibold border-r flex items-center">{tech.name}</div>
                         <div className="flex-grow grid grid-cols-7">
                            {weekDays.map((day, dayIndex) => (
                                <div key={dayIndex} className="relative bg-muted/20 border-l min-h-[96px] p-1 space-y-1">
                                    {/* Drop targets */}
                                    {hours.map(hour => (
                                        <TimeSlot 
                                            key={`${hour}-full`} 
                                            technicianId={tech.id} 
                                            startTime={new Date(day.setHours(hour,0,0,0))} 
                                            onDrop={onJobDrop} 
                                        />
                                    ))}

                                    {/* Render jobs */}
                                    {jobs.filter(j => j.technicianId === tech.id && isSameDay(new Date(j.schedule.start), day))
                                        .map(job => {
                                            const durationMinutes = (new Date(job.schedule.end).getTime() - new Date(job.schedule.start).getTime()) / (1000 * 60);
                                            const topPosition = (new Date(job.schedule.start).getHours() - 7 + new Date(job.schedule.start).getMinutes() / 60) * 60;
                                            return (
                                                 <div
                                                    key={job.id}
                                                    className="absolute w-full left-0"
                                                    style={{
                                                        top: `${topPosition}px`,
                                                        height: `${durationMinutes}px`,
                                                    }}
                                                >
                                                    <DraggableJob job={job} onStatusChange={onJobStatusChange} isCompact/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
};


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
    const { role } = useRole();
    const [isScheduling, setIsScheduling] = React.useState(false);
    
    const getHref = (path: string) => {
        return role ? `${path}?role=${role}` : path;
    };
    
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
       <div className="w-full md:w-64 flex flex-col gap-4">
        <ScheduleJobDialog />
        <UnscheduledJobsPanel jobs={unscheduledJobs} technicians={technicians} />
      </div>
      <Card className="flex-grow h-full flex flex-col">
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
            <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="day">Daily</TabsTrigger>
                  <TabsTrigger value="week">Weekly</TabsTrigger>
                  <TabsTrigger value="technician">By Technician</TabsTrigger>
                </TabsList>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-0">
            <TabsContent value="day" className="h-full mt-0 p-4">
              <DailyView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate} />
            </TabsContent>
            <TabsContent value="week" className="h-full mt-0">
              <WeeklyView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate} />
            </TabsContent>
            <TabsContent value="technician" className="h-full mt-0">
              <TechnicianView jobs={jobs} technicians={technicians} onJobDrop={onJobDrop} onJobStatusChange={onJobStatusChange} currentDate={currentDate} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
