
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { addDays } from 'date-fns';
import { addJob, updateJob as dbUpdateJob } from '@/lib/firestore/jobs';
import { useToast } from '@/hooks/use-toast';
import { getAllCustomers } from '@/lib/firestore/customers';

function SchedulingPageContent() {
  // State management
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week');
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            const initialJobs = mockData.jobs as Job[];
            const initialCustomers = await getAllCustomers();
            const initialTechnicians = mockData.technicians as Technician[];
            const initialEvents = mockData.googleCalendarEvents as GoogleCalendarEvent[];
            
            setJobs(initialJobs);
            setCustomers(initialCustomers);
            setTechnicians(initialTechnicians);
            setGoogleEvents(initialEvents);
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
    };
    fetchData();
    setIsComponentLoaded(true);
  }, [toast]);

  // Handle new job creation
  const handleJobCreated = useCallback((newJob: Job) => {
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
            updatedAt: new Date()
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
  const handleJobDrop = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    const jobToMove = jobs.find(j => j.id === jobId);
    if (!jobToMove) return;

    const durationMs = jobToMove.duration ? jobToMove.duration * 60 * 1000 : 60 * 60 * 1000;
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

    handleJobUpdate(jobId, updates);
  }, [jobs, handleJobUpdate]);

  // Handle job status changes
  const handleJobStatusChange = useCallback((jobId: string, newStatus: Job['status']) => {
    const updates: Partial<Job> = { status: newStatus };
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

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
  const enrichedJobsAndEvents = (() => {
    const enrichedJobs = jobs.flatMap(job => {
      const customer = customers.find(c => c.id === job.customerId);
      const allTechniciansForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);

      if (allTechniciansForJob.length === 0 && job.status !== 'unscheduled') {
        return [{
          ...job,
          originalId: job.id,
          customerName: customer?.primaryContact.name || 'Unknown Customer',
          technicianName: 'Unassigned',
          technicianId: 'unassigned',
          color: '#A0A0A0',
          isGhost: false,
          type: 'job' as const
        }];
      }

      if (job.status === 'unscheduled') {
        return [{
          ...job,
          originalId: job.id,
          customerName: customer?.primaryContact.name || 'Unknown Customer',
          technicianName: 'Unassigned',
          type: 'job' as const
        }];
      }

      return allTechniciansForJob.map((techId, index) => {
        const technician = technicians.find(t => t.id === techId);
        return {
          ...job,
          originalId: job.id,
          id: index === 0 ? job.id : `${job.id}-ghost-${techId}`,
          customerName: customer?.primaryContact.name || 'Unknown Customer',
          technicianName: technician?.name || 'Unassigned',
          technicianId: techId,
          color: technician?.color || '#A0A0A0',
          isGhost: index !== 0,
          type: 'job' as const
        };
      });
    });

    const enrichedEvents = googleEvents.map(event => ({ 
      ...event, 
      type: 'google_event' as const 
    }));

    return [...enrichedJobs, ...enrichedEvents];
  })();

  // Split items for display
  const scheduledItems = enrichedJobsAndEvents.filter(item => 
    (item.type === 'job' && item.status !== 'unscheduled') || item.type === 'google_event'
  );
  
  const unscheduledJobs = enrichedJobsAndEvents.filter((item): item is Job & { originalId: string, type: 'job' } => 
    item.type === 'job' && item.status === 'unscheduled'
  );

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
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <ScheduleView
          items={scheduledItems}
          unscheduledJobs={unscheduledJobs}
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
    </DndProvider>
  );
}

export default function SchedulingPage() {
  return <SchedulingPageContent />;
}
