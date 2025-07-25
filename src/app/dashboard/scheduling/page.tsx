

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
    setJobs(prevJobs => [newJob, ...prevJobs]);
    toast({
      title: "Job Created",
      description: `New job "${newJob.title}" has been added.`
    });
  }, [toast]);

  const handleJobUpdate = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    console.log("🔥 === MOVE JOB START ===");
    console.log("📋 Job ID received:", jobId);
    console.log("👨‍💼 New Technician ID:", newTechnicianId);
    console.log("📅 New Start Time:", newStartTime);
    
    // Check current state BEFORE update
    console.log("📊 BEFORE UPDATE:");
    console.log("Current jobs array length:", jobs.length);
    console.log("Job exists in current state:", jobs.find(j => j.id === jobId) ? "YES" : "NO");
    console.log("All job IDs:", jobs.map(j => j.id));

    setJobs(prevJobs => {
        console.log("🔄 INSIDE setJobs callback");
        console.log("Previous jobs length:", prevJobs.length);
        console.log("Looking for job with ID:", jobId);

        const jobIndex = prevJobs.findIndex(j => j.id === jobId);
        console.log("Job index found:", jobIndex);

        if (jobIndex === -1) {
            console.error("❌ JOB NOT FOUND IN setJobs!");
            console.log("Available job IDs in prevJobs:", prevJobs.map(j => j.id));
            return prevJobs;
        }
        const jobToMove = prevJobs[jobIndex];
        console.log("📦 Job found:", {
            id: jobToMove.id,
            status: jobToMove.status,
            technicianId: jobToMove.technicianId,
            title: jobToMove.title
        });
        
        // Create updated job
        const updatedJob = {
            ...jobToMove,
            technicianId: newTechnicianId,
            schedule: {
                ...jobToMove.schedule,
                start: newStartTime,
                end: new Date(newStartTime.getTime() + (jobToMove.duration || 60) * 60 * 1000),
                unscheduled: false
            },
            status: 'scheduled' as const,
            updatedAt: new Date()
        };
        console.log("✨ Updated job created:", {
            id: updatedJob.id,
            status: updatedJob.status,
            technicianId: updatedJob.technicianId,
            schedule: updatedJob.schedule
        });

        // Create new array
        const newJobs = [...prevJobs];
        newJobs[jobIndex] = updatedJob;
        console.log("🎯 New jobs array created:");
        console.log("Length:", newJobs.length);
        console.log("Updated job in array:", newJobs[jobIndex]);
        console.log("Job at index", jobIndex, ":", {
            id: newJobs[jobIndex].id,
            status: newJobs[jobIndex].status,
            technicianId: newJobs[jobIndex].technicianId
        });

        return newJobs;
    });

    // Add a timeout to check state after React processes the update
    setTimeout(() => {
        console.log("⏰ CHECKING STATE AFTER UPDATE:");
        console.log("Jobs length after update:", jobs.length);
        const updatedJob = jobs.find(j => j.id === jobId);
        console.log("Updated job in state:", updatedJob ? {
            id: updatedJob.id,
            status: updatedJob.status,
            technicianId: updatedJob.technicianId
        } : "NOT FOUND");
    }, 100);

    console.log("🔥 === MOVE JOB END ===");
  }, [jobs]);


  // Handle date navigation
  const handleDateNavigation = useCallback((direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  }, [activeView]);

  const enrichedJobsAndEvents = useMemo(() => {
    console.log("🔍 === ENRICHING JOBS ===");
    console.log("Input jobs:", jobs.length);
    jobs.forEach((job, index) => {
      console.log(`Job ${index}:`, {
        id: job.id,
        status: job.status,
        technicianId: job.technicianId,
        title: job.title
      });
    });

    const enrichedJobs = jobs.map(job => {
      const customer = customers.find(c => c.id === job.customerId);
      const allTechniciansForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);
      
      const enrichedJobBase = {
          ...job,
          originalId: job.id,
          customerName: customer?.primaryContact.name || 'Unknown Customer',
          type: 'job' as const,
      };

      if (allTechniciansForJob.length === 0) {
          return [{ ...enrichedJobBase, technicianId: 'unscheduled', technicianName: 'Unassigned', isGhost: false }];
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

    const result = [...enrichedJobs, ...enrichedEvents];
    
    console.log("🔍 === ENRICHMENT COMPLETE ===");
    console.log("Enriched items total:", result.length);
    console.log("Scheduled items:", result.filter(item => (item.type === 'job' && item.status !== 'unscheduled') || item.type === 'google_event').length);
    console.log("Unscheduled items:", result.filter(item => item.type === 'job' && item.status === 'unscheduled').length);

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

