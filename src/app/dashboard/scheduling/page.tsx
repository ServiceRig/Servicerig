
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

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        console.log("=== INITIALIZING SCHEDULE DATA ===");
        
        const initialJobs = mockData.jobs as Job[];
        const initialCustomers = await getAllCustomers();
        const initialTechnicians = mockData.technicians as Technician[];
        const initialEvents = mockData.googleCalendarEvents as GoogleCalendarEvent[];
        
        console.log("Initial jobs loaded:", initialJobs.length);
        console.log("Initial customers loaded:", initialCustomers.length);
        console.log("Initial technicians loaded:", initialTechnicians.length);
        
        setJobs(initialJobs);
        setCustomers(initialCustomers);
        setTechnicians(initialTechnicians);
        setGoogleEvents(initialEvents);
        
        setLoading(false);
    }
    fetchData();
  }, []);

  // Handle new job creation
  const handleJobCreated = useCallback((newJob: Job) => {
    console.log("=== NEW JOB CREATED CALLBACK ===");
    console.log("Adding job:", newJob.id);
    
    setJobs(prevJobs => {
        // Prevent adding duplicates if state is somehow already updated
        if (prevJobs.some(job => job.id === newJob.id)) {
            return prevJobs;
        }
        return [newJob, ...prevJobs];
    });
    
    toast({
      title: "Job Created",
      description: `New job "${newJob.title}" has been added.`
    });
  }, [toast]);

  // Handle job movement/dropping
  const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    console.log("🔴 MOVE JOB CALLED");
    console.log("📋 Job ID:", jobId);
    console.log("👨‍💼 New Technician ID:", newTechnicianId);
    console.log("📅 New Start Time:", newStartTime);
    console.log("📊 Current jobs array:", jobs);
    console.log("🔢 Current jobs count:", jobs.length);
    // Check if job exists in current state
    const existingJob = jobs.find(j => j.id === jobId);
    console.log("🔍 Found existing job:", existingJob);
    if (!existingJob) {
        console.error("❌ JOB NOT FOUND IN CURRENT STATE!");
        console.log("Available job IDs:", jobs.map(j => j.id));
        return;
    }
    console.log("✅ About to call setJobs...");
    setJobs(prevJobs => {
        console.log("🔄 INSIDE setJobs callback");
        console.log("Previous jobs:", prevJobs.length);
        
        const jobIndex = prevJobs.findIndex(j => j.id === jobId);
        console.log("Job index found:", jobIndex);

        if (jobIndex === -1) {
            console.error("❌ Job not found in setJobs callback!");
            return prevJobs;
        }
        const jobToMove = prevJobs[jobIndex];
        console.log("Job to move:", jobToMove);
        // Create the updated job
        const updatedJob = {
            ...jobToMove,
            technicianId: newTechnicianId,
            schedule: {
                ...jobToMove.schedule,
                start: newStartTime,
                end: new Date(newStartTime.getTime() + 60 * 60 * 1000), // 1 hour duration
                unscheduled: false
            },
            status: 'scheduled' as const,
            updatedAt: new Date()
        };
        console.log("✨ Updated job:", updatedJob);
        const newJobs = [...prevJobs];
        newJobs[jobIndex] = updatedJob;
        console.log("🎯 New jobs array length:", newJobs.length);
        console.log("🎯 Updated job in new array:", newJobs[jobIndex]);
        return newJobs;
    });
    console.log("✅ setJobs has been called, waiting for re-render...");
}, [jobs]);

  // Handle job status changes
  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    console.log("=== UPDATING JOB STATUS ===");
    console.log("Job ID:", jobId);
    console.log("New Status:", newStatus);

    setJobs(prevJobs => {
      const jobIndex = prevJobs.findIndex(j => j.id === jobId);
      if (jobIndex === -1) {
        console.error(`Job with id ${jobId} not found for status update.`);
        return prevJobs;
      }

      const updatedJob = { 
        ...prevJobs[jobIndex], 
        status: newStatus,
        updatedAt: new Date()
      };

      if (newStatus === 'unscheduled') {
        updatedJob.technicianId = '';
        updatedJob.schedule.unscheduled = true;
      }

      // Update database in background
      updateJob(updatedJob);

      return prevJobs.map(job => job.id === jobId ? updatedJob : job);
    });

    toast({
      title: "Job Status Updated",
      description: `Job status changed to ${newStatus}.`
    });
  }, [toast]);

  // Handle date navigation
  const handleDateNavigation = useCallback((direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  }, [activeView]);

    const enrichedJobsAndEvents = useMemo(() => {
        console.log("=== ENRICHED JOBS CALCULATION ===");
        console.log("Input jobs:", jobs.length);
        const enrichedJobs = jobs.map(job => {
            const customer = customers.find(c => c.id === job.customerId);
            const allTechniciansForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);
            
            const enrichedJob = {
                ...job,
                originalId: job.id,
                customerName: customer?.primaryContact.name || 'Unknown Customer',
                type: 'job' as const,
            };

            if (job.status === 'unscheduled') {
                return [{ ...enrichedJob, technicianId: 'unscheduled', technicianName: 'Unassigned', isGhost: false }];
            }

            if (allTechniciansForJob.length === 0) {
                return [{ ...enrichedJob, technicianId: 'unassigned', technicianName: 'Unassigned', isGhost: false }];
            }
            
            return allTechniciansForJob.map((techId, index) => {
                const technician = technicians.find(t => t.id === techId);
                return {
                    ...enrichedJob,
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

        const result = [...enrichedJobs, ...enrichedEvents];
        console.log("Output enriched jobs:", result.length);
        return result;
    }, [jobs, customers, technicians, googleEvents]);


  const scheduledItems = enrichedJobsAndEvents.filter(item => 
    (item.type === 'job' && item.status !== 'unscheduled') || item.type === 'google_event'
  );
  
  const unscheduledJobs = enrichedJobsAndEvents.filter((item): item is Job & { originalId: string, type: 'job' } => 
    item.type === 'job' && item.status === 'unscheduled'
  );

  console.log("🖥️ RENDERING SCHEDULE VIEW WITH:");
  console.log("Scheduled items count:", scheduledItems.length);
  console.log("Unscheduled jobs count:", unscheduledJobs.length);
  console.log("Jobs state count:", jobs.length);

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
          onJobStatusChange={updateJobStatus}
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
