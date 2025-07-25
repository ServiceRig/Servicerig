
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/scheduling/ScheduleView";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent, UserRole, Estimate, ServiceAgreement } from "@/lib/types";
import { useEffect, useState, useCallback, useMemo } from "react";
import { addDays, setHours, setMinutes } from 'date-fns';
import { addJob, updateJob as dbUpdateJob } from '@/lib/firestore/jobs';
import { useToast } from '@/hooks/use-toast';
import { getAllCustomers } from '@/lib/firestore/customers';
import { MasterListView } from '@/components/dashboard/scheduling/MasterListView';
import { ToBeScheduledList } from '@/components/dashboard/scheduling/ToBeScheduledList';
import { DragIndicator } from '@/components/dashboard/scheduling/DragIndicator';

type SchedulableItem = {
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


function SchedulingPageContent() {
  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [serviceAgreements, setServiceAgreements] = useState<ServiceAgreement[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week');
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  
  const [stagedJobs, setStagedJobs] = useState<Job[]>([]);

  const { toast } = useToast();
  
  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
        setLoading(true);
        const initialJobs = mockData.jobs as Job[];
        const initialCustomers = await getAllCustomers();
        const initialTechnicians = mockData.technicians as Technician[];
        const initialEvents = mockData.googleCalendarEvents as GoogleCalendarEvent[];
        const initialEstimates = mockData.estimates as Estimate[];
        const initialServiceAgreements = mockData.serviceAgreements as ServiceAgreement[];
        
        setJobs(initialJobs);
        setCustomers(initialCustomers);
        setTechnicians(initialTechnicians);
        setGoogleEvents(initialEvents);
        setEstimates(initialEstimates);
        setServiceAgreements(initialServiceAgreements);

    } catch (error) {
        console.error("❌ Error fetching data:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load schedule data."
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    setIsComponentLoaded(true);
  }, [fetchData]);

  // Handle new job creation
  const handleJobCreated = useCallback((newJobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob: Job = {
      ...newJobData,
      id: `job_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, you'd call a server action and then update state
    // For mock data, we update both our "DB" and state
    mockData.jobs.unshift(newJob);
    setJobs(prevJobs => [newJob, ...prevJobs]);


    toast({
      title: "Job Created",
      description: `New job "${newJob.title}" has been added.`
    });
  }, [toast]);

  // Handle job updates (including drag/drop)
   const handleJobUpdate = useCallback((jobId: string, updates: Partial<Job>) => {
    setJobs(prevJobs => {
      const jobIndex = prevJobs.findIndex(j => j.id === jobId);
      if (jobIndex === -1) {
        console.error(`❌ Job with ID ${jobId} not found in state!`);
        return prevJobs;
      }

      const jobToUpdate = prevJobs[jobIndex];
      const updatedJob = {
        ...jobToUpdate,
        ...updates,
        schedule: {
          ...jobToUpdate.schedule,
          ...updates.schedule,
        },
        updatedAt: new Date(),
      };
      
      dbUpdateJob(updatedJob);

      const newJobs = [...prevJobs];
      newJobs[jobIndex] = updatedJob;

      return newJobs;
    });

     toast({
        title: "Job Updated",
        description: `Job has been updated.`
    });
  }, [toast]);

  // Handle job drag and drop specifically
  const handleJobDrop = useCallback((item: {id: string, type: 'job' | 'google_event', originalData: SchedulableItem}, newTechnicianId: string, newStartTime: Date) => {
    const { id, type, originalData } = item;
    
    if (type === 'google_event' && originalData) {
        const durationMs = new Date(originalData.end).getTime() - new Date(originalData.start).getTime();
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        const newJobData = {
            title: originalData.title,
            description: originalData.description || `Synced from Google Calendar event by ${originalData.createdBy}`,
            customerId: 'cust1', // Placeholder customer
            technicianId: newTechnicianId,
            status: 'scheduled' as const,
            schedule: {
                start: newStartTime,
                end: newEndTime,
                unscheduled: false,
                multiDay: false
            },
            duration: durationMs / (1000 * 60),
            details: { serviceType: 'Synced', trade: 'Other', category: 'Synced' }
        };
        handleJobCreated(newJobData);
        
        setGoogleEvents(prevEvents => prevEvents.filter(event => event.eventId !== id));
        
        toast({ title: 'Event Converted to Job', description: `Google Calendar event "${originalData.title}" is now a ServiceRig job.`});
        
    } else { 
        const jobToMove = jobs.find(j => j.id === id);
        if (!jobToMove) return;

        const durationMs = jobToMove.duration ? jobToMove.duration * 60 * 1000 : (60 * 60 * 1000);
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        const updates: Partial<Job> = {
          technicianId: newTechnicianId,
          status: 'scheduled',
          schedule: {
            ...jobToMove.schedule,
            start: newStartTime,
            end: newEndTime,
            unscheduled: false
          }
        };

        handleJobUpdate(id, updates);
        setStagedJobs(prev => prev.filter(job => job.id !== id));
    }
  }, [jobs, handleJobUpdate, handleJobCreated, toast]);

  // Handle job status changes
  const handleJobStatusChange = useCallback((jobId: string, newStatus: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const updates: Partial<Job> = { status: newStatus };

    if (newStatus === 'unscheduled') {
      updates.schedule = { ...job.schedule, unscheduled: true };
    }
    handleJobUpdate(jobId, updates);
  }, [jobs, handleJobUpdate]);

  const handleStageJobs = useCallback((jobIds: string[], reschedule: boolean = false) => {
    const jobsToStage = jobs
        .filter(job => jobIds.includes(job.id))
        .map(job => ({
            ...job,
            customerName: customers.find(c => c.id === job.customerId)?.primaryContact.name || 'Unknown',
        }));
    
    setStagedJobs(prev => {
        const existingIds = new Set(prev.map(j => j.id));
        const newJobs = jobsToStage.filter(j => !existingIds.has(j.id));
        return [...prev, ...newJobs];
    });

    if (reschedule) {
        jobIds.forEach(id => handleJobStatusChange(id, 'unscheduled'));
        toast({ title: "Jobs Unscheduled", description: `${jobIds.length} jobs have been moved to the 'To Be Scheduled' list.`});
    } else {
        toast({ title: "Jobs Staged", description: `${jobIds.length} jobs are ready to be scheduled.`});
    }

  }, [jobs, customers, handleJobStatusChange, toast]);

  // Handle date navigation
  const handleDateNavigation = useCallback((direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  }, [activeView]);

  // Enrich jobs with customer and technician data
  const enrichedJobsAndEvents: SchedulableItem[] = useMemo(() => {
    const enrichedJobs = jobs.flatMap(job => {
        const customer = customers.find(c => c.id === job.customerId);
        const allTechniciansForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);

        if (job.status === 'unscheduled') {
            return []; // Unscheduled jobs are handled in the Master List / To Be Scheduled list
        }
        
        if (allTechniciansForJob.length === 0) {
            return [{
                ...job,
                id: job.id,
                originalId: job.id,
                start: new Date(job.schedule.start),
                end: new Date(job.schedule.end),
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                technicianName: 'Unassigned',
                technicianId: 'unassigned',
                color: '#A0A0A0',
                isGhost: false,
                type: 'job' as const
            }];
        }

        return allTechniciansForJob.map((techId, index) => {
            const technician = technicians.find(t => t.id === techId);
            return {
                ...job,
                id: index === 0 ? job.id : `${job.id}-ghost-${techId}`,
                originalId: job.id,
                start: new Date(job.schedule.start),
                end: new Date(job.schedule.end),
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                technicianName: technician?.name || 'Unassigned',
                technicianId: techId,
                color: technician?.color || '#A0A0A0',
                isGhost: index !== 0,
                type: 'job' as const
            };
        });
    });

    const enrichedEvents: SchedulableItem[] = googleEvents.map(event => ({
      id: event.eventId,
      originalId: event.eventId,
      title: event.summary,
      start: new Date(event.start),
      end: new Date(event.end),
      type: 'google_event',
      createdBy: event.createdBy,
      description: event.description,
      matchedTechnicianId: event.matchedTechnicianId
    }));

    return [...enrichedJobs, ...enrichedEvents];
  }, [jobs, customers, technicians, googleEvents]);


  // Show loading state
  if (loading || !isComponentLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-4 text-lg">Loading Schedule...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
       <DragIndicator />
      <div className="flex flex-col gap-6">
        {/* Top Section: Schedule and To-Be-Scheduled List */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
           <div className="lg:col-span-1">
                <ToBeScheduledList jobs={stagedJobs} />
           </div>
           <div className="lg:col-span-1">
               <ScheduleView
                    items={enrichedJobsAndEvents}
                    technicians={technicians}
                    onJobDrop={handleJobDrop}
                    onJobStatusChange={handleJobStatusChange}
                    onJobCreated={handleJobCreated}
                    currentDate={currentDate}
                    onCurrentDateChange={setCurrentDate}
                    onPrevious={() => handleDateNavigation('prev')}
                    onNext={() => handleDateNavigation('next')}
                    activeView={activeView}
                    onActiveViewChange={setActiveView}
                />
           </div>
        </div>

        {/* Bottom Section: Master List */}
        <div>
            <MasterListView
              jobs={jobs}
              estimates={estimates}
              serviceAgreements={serviceAgreements}
              customers={customers}
              technicians={technicians}
              onStageJobs={handleStageJobs}
            />
        </div>
      </div>
    </DndProvider>
  );
}

export default function SchedulingPage() {
  return <SchedulingPageContent />;
}
