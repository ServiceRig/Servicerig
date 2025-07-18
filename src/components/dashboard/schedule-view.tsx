
'use client'
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job, Technician } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, GripVertical, MoreHorizontal } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

// --- MOCK DATA & HELPERS ---
const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getStatusColor = (status: Job['status']) => {
    switch (status) {
        case 'scheduled': return 'bg-blue-200 border-blue-400 text-blue-800';
        case 'in_progress': return 'bg-yellow-200 border-yellow-400 text-yellow-800';
        case 'complete': return 'bg-green-200 border-green-400 text-green-800';
        default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
}

// --- SUB-COMPONENTS ---

const JobBubble = ({ job }: { job: any }) => (
    <Popover>
        <PopoverTrigger asChild>
            <div
                className={cn(
                    "absolute p-2 rounded-md border text-xs cursor-pointer overflow-hidden",
                    getStatusColor(job.status)
                )}
                style={{
                    top: `${((job.schedule.start.getHours() - 7 + job.schedule.start.getMinutes() / 60) * 60)}px`,
                    height: `${(job.schedule.end.getTime() - job.schedule.start.getTime()) / (1000 * 60)}px`,
                    left: '0.5rem',
                    right: '0.5rem',
                }}
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
                    <CommandGroup>
                        <CommandItem onSelect={() => alert(`Opening details for ${job.title}`)}>Open Job Details</CommandItem>
                        <CommandItem onSelect={() => alert(`Changing status for ${job.title}`)}>Change Status</CommandItem>
                        <CommandItem onSelect={() => alert(`Removing ${job.title}`)} className="text-destructive">Remove from Schedule</CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
);

const UnscheduledJobCard = ({ job }: { job: any }) => (
    <Card className="mb-2 p-2 cursor-grab active:cursor-grabbing">
        <CardHeader className="p-1">
            <CardTitle className="text-sm font-bold">{job.title}</CardTitle>
            <CardDescription className="text-xs">{job.customerName}</CardDescription>
        </CardHeader>
        <CardContent className="p-1 text-xs text-muted-foreground">
            {job.details.serviceType}
        </CardContent>
    </Card>
);

const UnscheduledJobsPanel = ({ jobs }: { jobs: any[] }) => (
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


// --- VIEW COMPONENTS ---

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


const DailyView = ({ jobs, technicians }: { jobs: any[], technicians: Technician[] }) => {
    const [selectedTech, setSelectedTech] = React.useState<string | 'all'>('all');
    const filteredJobs = jobs.filter(j => selectedTech === 'all' || j.technicianId === selectedTech);

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
                    {(selectedTech === 'all' ? technicians : technicians.filter(t => t.id === selectedTech)).map(tech => (
                        <div key={tech.id}>
                            <h3 className="font-semibold text-center mb-2">{tech.name}</h3>
                            <div className="relative bg-muted/40 rounded-lg min-h-[calc(16*60px)]">
                                {/* Dashed drop target */}
                                <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg"></div>
                                {filteredJobs.filter(j => j.technicianId === tech.id).map(job => (
                                    <JobBubble key={job.id} job={job} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const WeeklyView = ({ jobs, technicians }: { jobs: any[], technicians: Technician[] }) => (
    <div className="flex-grow grid grid-cols-[auto_1fr] gap-4">
        <div className="w-16"><TimeAxis/></div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="grid grid-cols-7 gap-px w-max bg-border">
                {days.map((day, dayIndex) => (
                    <div key={day} className="w-48 bg-background">
                        <h3 className="font-semibold text-center my-2">{day}</h3>
                        <div className="relative min-h-[calc(16*60px)]">
                             <div className="absolute inset-0 border-r border-border"></div>
                             {jobs.filter(j => j.schedule.start.getDay() === (dayIndex + 1) % 7).map(job => (
                                 <JobBubble key={job.id} job={job} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-4"></div>
        </ScrollArea>
    </div>
);

const TechnicianView = ({ jobs, technicians }: { jobs: any[], technicians: Technician[] }) => (
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
                     {days.map(day => <h3 key={day} className="font-semibold text-center my-2 bg-background w-48">{day}</h3>)}
                 </div>
                 <div className="bg-border grid grid-cols-7 gap-px">
                     {days.map((day, dayIndex) => (
                         <div key={day} className="bg-background w-48">
                            {technicians.map(tech => (
                                <div key={tech.id} className="relative h-[60px] border-t border-dashed">
                                     {jobs.filter(j => j.technicianId === tech.id && j.schedule.start.getDay() === (dayIndex + 1) % 7).map(job => (
                                        <div key={job.id} className={cn("absolute inset-y-1 left-1 right-1 rounded p-1 text-[10px] cursor-pointer overflow-hidden", getStatusColor(job.status))}>
                                            <p className="font-bold truncate">{job.title}</p>
                                            <p className="truncate">{job.customerName}</p>
                                        </div>
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
);


export function ScheduleView({ jobs, unscheduledJobs, technicians }: { jobs: any[], unscheduledJobs: any[], technicians: Technician[] }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 h-full">
            <UnscheduledJobsPanel jobs={unscheduledJobs} />
            <Card className="flex-grow h-full">
                <Tabs defaultValue="day" className="h-full flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>Drag, drop, and resize jobs to schedule your team.</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="day">Daily</TabsTrigger>
                            <TabsTrigger value="week">Weekly</TabsTrigger>
                            <TabsTrigger value="technician">By Technician</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        <TabsContent value="day">
                            <DailyView jobs={jobs} technicians={technicians} />
                        </TabsContent>
                        <TabsContent value="week">
                             <WeeklyView jobs={jobs} technicians={technicians} />
                        </TabsContent>
                        <TabsContent value="technician">
                            <TechnicianView jobs={jobs} technicians={technicians} />
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
        </div>
    );
}
