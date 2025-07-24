

'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent } from "@/lib/types";
import { useEffect, useState, useCallback, createContext, useContext, useMemo } from "react";
import { addDays, eachDayOfInterval, startOfDay, endOfDay, max, min, isSameDay, setHours, setMinutes, getHours, getMinutes, isBefore, format } from 'date-fns';

// Create a context for schedule view state
interface ScheduleViewContextType {
  isFitToScreen: boolean;
  setIsFitToScreen: (value: boolean) => void;
}

const ScheduleViewContext = createContext<ScheduleViewContextType | null>(null);

export const useScheduleView = () => {
    const context = useContext(ScheduleViewContext);
    if (!context) {
        throw new Error('useScheduleView must be used within a ScheduleViewProvider');
    }
    return context;
};

export const ScheduleViewProvider = ({ children }: { children: React.ReactNode }) => {
    const [isFitToScreen, setIsFitToScreen] = useState(true);
    return (
        <ScheduleViewContext.Provider value={{ isFitToScreen, setIsFitToScreen }}>
            {children}
        </ScheduleViewContext.Provider>
    );
};

function SchedulingPageContent() {
  const [jobs, setJobs] = useState<Job[]>(mockData.jobs as Job[]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
        setCustomers(mockData.customers as Customer[]);
        setTechnicians(mockData.technicians as Technician[]);
        setGoogleEvents(mockData.googleCalendarEvents as GoogleCalendarEvent[]);
        setLoading(false);
    }, 500);
  }, []);
  
  const handleJobCreated = (newJob: Job) => {
    console.log("=== HANDLE JOB CREATED CALLED ===");
    console.log("New job received:", newJob);
    console.log("Current jobs state before:", jobs.length);
    
    setJobs(prevJobs => {
        const updatedJobs = [...prevJobs, newJob];
        console.log("Updated jobs state after:", updatedJobs.length);
        return updatedJobs;
    });
  };
  
  const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    setJobs(prevJobs => {
        const jobToMoveIndex = prevJobs.findIndex(j => j.id === jobId);
        if (jobToMoveIndex === -1) {
            console.error(`Job with id ${jobId} not found!`);
            return prevJobs;
        }

        const jobToMove = prevJobs[jobToMoveIndex];
        
        const minutes = newStartTime.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        const snappedStartTime = new Date(newStartTime);
        snappedStartTime.setMinutes(roundedMinutes, 0, 0);

        let durationMs: number;
        if (jobToMove.status === 'unscheduled' || !jobToMove.schedule.end) {
            durationMs = 60 * 60 * 1000;
        } else {
            durationMs = new Date(jobToMove.schedule.end).getTime() - new Date(jobToMove.schedule.start).getTime();
        }

        const newEndTime = new Date(snappedStartTime.getTime() + durationMs);
        
        const updatedJob = { ...jobToMove, technicianId: newTechnicianId, schedule: { ...jobToMove.schedule, start: snappedStartTime, end: newEndTime }, status: 'scheduled' as Job['status'] };
        
        const newJobs = [...prevJobs];
        newJobs[jobToMoveIndex] = updatedJob;
        
        // This is the key fix: update the local state immediately.
        // Also update the mockData so changes persist across reloads in dev.
        const mockDataIndex = mockData.jobs.findIndex((j: Job) => j.id === jobId);
        if (mockDataIndex !== -1) {
            mockData.jobs[mockDataIndex] = updatedJob;
        }

        return newJobs;
    });
  }, [setJobs]);

  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    setJobs(prevJobs => {
      const jobIndex = prevJobs.findIndex(j => j.id === jobId);
      if(jobIndex === -1) {
          console.error(`Job with id ${jobId} not found for status update.`);
          return prevJobs;
      }
      
      const updatedJob = { ...prevJobs[jobIndex], status: newStatus };
      const newJobs = [...prevJobs];
      newJobs[jobIndex] = updatedJob;
      return newJobs;
    });
  }, [setJobs]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week');

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  };
  
    const { startHour, endHour } = mockData.scheduleSettings;

    const enrichedJobsAndEvents = useMemo(() => {
    const enrichedJobs = (jobs ?? []).flatMap(job => {
        const customer = customers.find(c => c.id === job.customerId);
        
        // Handle multi-day jobs by creating "ghost" events for display
        const jobStartDate = new Date(job.schedule.start);
        const jobEndDate = new Date(job.schedule.end);
        
        if (!isSameDay(jobStartDate, jobEndDate)) {
            const dateRange = eachDayOfInterval({ start: jobStartDate, end: jobEndDate });
            return dateRange.map((date, index) => {
                const isPrimary = index === 0;
                const technician = technicians.find(t => t.id === job.technicianId);

                return {
                    ...job,
                    originalId: job.id,
                    id: `${job.id}-ghost-${index}`,
                    schedule: { ...job.schedule, start: date, end: date }, // Confine to single day for display
                    customerName: customer?.primaryContact.name || 'Unknown Customer',
                    technicianName: technician?.name || 'Unassigned',
                    color: technician?.color || '#A0A0A0',
                    isGhost: !isPrimary,
                    type: 'job'
                };
            });
        }
        
        // Handle single-day jobs
        const technician = technicians.find(t => t.id === job.technicianId);
        return [{
            ...job,
            originalId: job.id,
            customerName: customer?.primaryContact.name || 'Unknown Customer',
            technicianName: technician?.name || 'Unassigned',
            color: technician?.color || '#A0A0A0',
            isGhost: false,
            type: 'job'
        }];
    });

    const enrichedEvents = (googleEvents || []).map(event => ({ ...event, type: 'google_event' }));

    return [...enrichedJobs, ...enrichedEvents];
}, [jobs, customers, technicians, googleEvents]);


  const scheduledItems = enrichedJobsAndEvents.filter(item => (item.type === 'job' && item.status !== 'unscheduled') || item.type === 'google_event');
  const unscheduledJobs = enrichedJobsAndEvents.filter((item): item is Job & { originalId: string, type: 'job' } => item.type === 'job' && item.status === 'unscheduled');

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
    return (
        <SchedulingPageContent />
    )
}
