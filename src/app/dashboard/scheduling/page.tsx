
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent, UserRole, Estimate, ServiceAgreement } from "@/lib/types";
import { useEffect, useState, useCallback, useMemo } from "react";
import { addDays, setHours, setMinutes } from 'date-fns';
import { addJob, updateJob as dbUpdateJob } from '@/lib/firestore/jobs';
import { useToast } from '@/hooks/use-toast';
import { getAllCustomers } from '@/lib/firestore/customers';
import { MasterListView } from '@/components/dashboard/scheduling/MasterListView';

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
  const handleJobDrop = useCallback((item: SchedulableItem, newTechnicianId: string, newStartTime: Date) => {
    const { id, type } = item;
    
    if (type === 'google_event') {
        // Convert Google Event to a ServiceRig job
        const durationMs = new Date(item.end).getTime() - new Date(item.start).getTime();
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        // A real implementation might try to find an existing customer
        const newJobData = {
            title: item.title,
            description: item.description || `Synced from Google Calendar event by ${item.createdBy}`,
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
        
        // Remove the original Google event from the state to prevent duplication on the calendar
        setGoogleEvents(prevEvents => prevEvents.filter(event => event.eventId !== id));
        // A real app would also make an API call to delete the Google Calendar event
        
        toast({ title: 'Event Converted to Job', description: `Google Calendar event "${item.title}" is now a ServiceRig job.`});
        
    } else { // It's a regular job
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
    }
  }, [jobs, handleJobUpdate, handleJobCreated, toast]);

  // Handle job status changes
  const handleJobStatusChange = useCallback((jobId: string, newStatus: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const updates: Partial<Job> = { status: newStatus };

    if (newStatus === 'unscheduled') {
      updates.schedule = { ...job.schedule, unscheduled: true };
      updates.technicianId = '';
    }
    handleJobUpdate(jobId, updates);
  }, [jobs, handleJobUpdate]);

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
            return [{
                ...job,
                id: job.id,
                originalId: job.id,
                start: new Date(job.schedule.start),
                end: new Date(job.schedule.end),
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                technicianName: 'Unassigned',
                type: 'job' as const
            }];
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
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="p-4 text-lg">Loading Schedule...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full flex-col gap-6">
        <div className="h-[calc(100vh-8rem)]">
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
        <MasterListView
          jobs={jobs}
          estimates={estimates}
          serviceAgreements={serviceAgreements}
          customers={customers}
          technicians={technicians}
        />
      </div>
    </DndProvider>
  );
}

export default function SchedulingPage() {
  return <SchedulingPageContent />;
}
