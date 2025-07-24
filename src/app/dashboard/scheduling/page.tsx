

'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician, GoogleCalendarEvent } from "@/lib/types";
import { useEffect, useState, useCallback, createContext, useContext, useMemo } from "react";
import { addDays, eachDayOfInterval, startOfDay, endOfDay, max, min, isSameDay, setHours, setMinutes, getHours, getMinutes, isBefore, format } from 'date-fns';
import { updateJob } from '@/lib/firestore/jobs';

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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This simulates fetching initial data from a source like Firestore
    setJobs(mockData.jobs as Job[]);
    setCustomers(mockData.customers as Customer[]);
    setTechnicians(mockData.technicians as Technician[]);
    setGoogleEvents(mockData.googleCalendarEvents as GoogleCalendarEvent[]);
    setLoading(false);
  }, []);
  
  const handleJobCreated = (newJob: Job) => {
    setJobs(prevJobs => [...prevJobs, newJob]);
  };
  
const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    setJobs(prevJobs => {
        const jobToMoveIndex = prevJobs.findIndex(j => j.id === jobId);
        if (jobToMoveIndex === -1) {
            console.error(`Job with id ${jobId} not found!`);
            return prevJobs;
        }

        const newJobs = [...prevJobs];
        const jobToMove = { ...newJobs[jobToMoveIndex] };

        const minutes = newStartTime.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        const snappedStartTime = new Date(newStartTime);
        snappedStartTime.setMinutes(roundedMinutes, 0, 0);

        let durationMs: number;
        if (jobToMove.status === 'unscheduled' || !jobToMove.schedule.end) {
            durationMs = 60 * 60 * 1000; // Default to 1 hour
        } else {
            durationMs = new Date(jobToMove.schedule.end).getTime() - new Date(jobToMove.schedule.start).getTime();
        }

        const newEndTime = new Date(snappedStartTime.getTime() + durationMs);

        const updatedJob = {
            ...jobToMove,
            technicianId: newTechnicianId,
            schedule: { ...jobToMove.schedule, start: snappedStartTime, end: newEndTime, unscheduled: false },
            status: 'scheduled' as Job['status']
        };
        
        newJobs[jobToMoveIndex] = updatedJob;

        // Also update the central mock data source
        updateJob(updatedJob);

        return newJobs;
    });
}, []);

  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    setJobs(prevJobs => {
      const jobIndex = prevJobs.findIndex(j => j.id === jobId);
      if(jobIndex === -1) {
          console.error(`Job with id ${jobId} not found for status update.`);
          return prevJobs;
      }
      
      const updatedJob = { ...prevJobs[jobIndex], status: newStatus };
      if (newStatus === 'unscheduled') {
        updatedJob.technicianId = '';
      }
      
      const newJobs = [...prevJobs];
      newJobs[jobIndex] = updatedJob;

      updateJob(updatedJob);

      return newJobs;
    });
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week');

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  };
  
    const { startHour, endHour } = mockData.scheduleSettings;

    const enrichedJobsAndEvents = useMemo(() => {
        const enrichedJobs = (jobs || []).flatMap(job => {
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

        const enrichedEvents = (googleEvents || []).map(event => ({ ...event, type: 'google_event' as const }));

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
