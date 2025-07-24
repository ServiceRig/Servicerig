

'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent } from "@/lib/types";
import { useEffect, useState, useCallback, useMemo } from "react";
import { addDays } from 'date-fns';
import { updateJob, addJob } from '@/lib/firestore/jobs';
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
  
  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
      // setLoading(true); // Don't show loading spinner on re-fetches
      const initialJobs = mockData.jobs as Job[];
      const initialCustomers = await getAllCustomers();
      const initialTechnicians = mockData.technicians as Technician[];
      const initialEvents = mockData.googleCalendarEvents as GoogleCalendarEvent[];
      
      setJobs(initialJobs);
      setCustomers(initialCustomers);
      setTechnicians(initialTechnicians);
      setGoogleEvents(initialEvents);
      
      setLoading(false);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleJobCreated = useCallback(async (newJob: Job) => {
    toast({
      title: "Job Created",
      description: `New job "${newJob.title}" has been added.`
    });
    // Add to local state immediately for responsiveness
    setJobs(prevJobs => [newJob, ...prevJobs]);
    // Optionally re-fetch to ensure sync with "DB"
    await fetchData();
  }, [toast, fetchData]);

  const handleJobUpdate = useCallback(async (jobId: string, updates: Partial<Job>) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) {
        console.error("Job to update not found in state!");
        return;
    }

    const updatedJob = { ...jobToUpdate, ...updates, updatedAt: new Date() };
    
    await updateJob(updatedJob);
    
    // Optimistically update local state
    setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));

    toast({
        title: "Job Updated",
        description: `Job "${updatedJob.title}" has been updated.`
    });
  }, [jobs, toast]);


 const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    const jobToMove = jobs.find(j => j.id === jobId);
    if (!jobToMove) return;

    const updates: Partial<Job> = {
        technicianId: newTechnicianId,
        status: 'scheduled',
        schedule: {
            ...jobToMove.schedule,
            start: newStartTime,
            end: new Date(newStartTime.getTime() + (jobToMove.duration || 60) * 60 * 1000),
            unscheduled: false,
        }
    };
    handleJobUpdate(jobId, updates);
}, [jobs, handleJobUpdate]);


  // Handle job status changes
  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    let updates: Partial<Job> = { status: newStatus };
    if (newStatus === 'unscheduled') {
      updates.technicianId = '';
      updates.schedule = {
          ...jobs.find(j => j.id === jobId)!.schedule,
          unscheduled: true
      };
    }
    handleJobUpdate(jobId, updates);
  }, [jobs, handleJobUpdate]);

  // Handle date navigation
  const handleDateNavigation = useCallback((direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  }, [activeView]);

    const enrichedJobsAndEvents = useMemo(() => {
        const enrichedJobs = jobs.map(job => {
            const customer = customers.find(c => c.id === job.customerId);
            const allTechniciansForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);
            
            const enrichedJobBase = {
                ...job,
                originalId: job.id,
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                type: 'job' as const,
            };

            if (job.status === 'unscheduled') {
                return [{ ...enrichedJobBase, technicianId: 'unscheduled', technicianName: 'Unassigned', isGhost: false }];
            }

            if (allTechniciansForJob.length === 0) {
                return [{ ...enrichedJobBase, technicianId: 'unassigned', technicianName: 'Unassigned', isGhost: false }];
            }
            
            return allTechniciansForJob.map((techId, index) => {
                const technician = technicians.find(t => t.id === techId);
                return {
                    ...enrichedJobBase,
                    id: index === 0 ? job.id : `${job.id}-ghost-${techId}`,
                    technicianId: techId,
                    technicianName: technician?.name || 'Unassigned',
                    color: technician?.color || '#A0A0A0',
                    isGhost: index !== 0
                };
            });
        }).flat();

        const enrichedEvents = googleEvents.map(event => ({ 
            ...event, 
            type: 'google_event' as const 
        }));

        return [...enrichedJobs, ...enrichedEvents];
    }, [jobs, customers, technicians, googleEvents]);


  const scheduledItems = enrichedJobsAndEvents.filter(item => 
    (item.type === 'job' && item.status !== 'unscheduled') || item.type === 'google_event'
  );
  
  const unscheduledJobs = enrichedJobsAndEvents.filter((item): item is Job & { originalId: string, type: 'job' } => 
    item.type === 'job' && item.status === 'unscheduled'
  );

  if (loading) {
    return <div className="p-4">Loading Schedule...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <ScheduleView
          items={scheduledItems}
          unscheduledJobs={unscheduledJobs}
          technicians={technicians}
          onJobDrop={moveJob}
          onJobUpdate={handleJobUpdate}
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
