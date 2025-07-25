

'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent } from "@/lib/types";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  
  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
      setLoading(true);
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
  
  const handleJobCreated = useCallback(async (newJobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This function adds the job to the mock DB and returns the full job object
    const newJob = await addJob(newJobData);
    setJobs(prevJobs => [newJob, ...prevJobs]);
    toast({
      title: "Job Created",
      description: `New job "${newJob.title}" has been added.`
    });
  }, [toast]);

 const handleJobUpdate = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
        const jobToUpdate = jobs.find(j => j.id === jobId);
        if (!jobToUpdate) {
            console.error("Job to update not found:", jobId);
            return;
        }

        const updatedJob: Job = {
            ...jobToUpdate,
            ...updates,
            schedule: {
                ...jobToUpdate.schedule,
                ...updates.schedule,
            },
            updatedAt: new Date()
        };
        
        await dbUpdateJob(updatedJob); // Update mock DB

        setJobs(prevJobs => {
            const jobIndex = prevJobs.findIndex(j => j.id === jobId);
            if (jobIndex === -1) {
                return prevJobs; 
            }
            const newJobs = [...prevJobs];
            newJobs[jobIndex] = updatedJob;
            return newJobs;
        });

        toast({
            title: "Job Updated",
            description: `Job "${updatedJob.title}" has been updated.`
        });
    } catch (error) {
        console.error("Failed to update job:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update the job."
        });
    }
}, [jobs, toast]);


  // Handle date navigation
  const handleDateNavigation = useCallback((direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  }, [activeView]);

  const enrichedJobsAndEvents = useMemo(() => {
    const enrichedJobs = jobs.map(job => {
      const customer = customers.find(c => c.id === job.customerId);
      const technician = technicians.find(t => t.id === job.technicianId);
      return {
          ...job,
          originalId: job.id,
          customerName: customer?.primaryContact.name || 'Unknown Customer',
          technicianName: technician?.name || 'Unassigned',
          color: technician?.color || '#A0A0A0',
          type: 'job' as const,
      };
    });

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




