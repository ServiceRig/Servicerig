
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician } from "@/lib/types";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
        setCustomers(mockData.customers as Customer[]);
        setTechnicians(mockData.technicians as Technician[]);
        setLoading(false);
    }, 500);
  }, []);
  
  const handleJobCreated = useCallback((newJob: Job) => {
    console.log("Received new job in schedule page:", newJob);
    setJobs(prevJobs => {
        // Check if job already exists
        if (prevJobs.some(job => job.id === newJob.id)) {
            console.log("Job already exists, not adding duplicate");
            return prevJobs;
        }
        return [...prevJobs, newJob];
    });
  }, []);
  
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
        
        const updatedJob = { ...jobToMove, technicianId: newTechnicianId, schedule: { ...jobToMove.schedule, start: snappedStartTime, end: newEndTime }, status: 'scheduled' };
        
        const newJobs = [...prevJobs];
        newJobs[jobToMoveIndex] = updatedJob;
        
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
  
    const { startHour: workdayStartHour, endHour: workdayEndHour } = mockData.scheduleSettings;

    const enrichedJobs = useMemo(() => {
        return (jobs ?? []).flatMap(job => {
            if (job.status === 'unscheduled') {
                const customer = customers.find(c => c.id === job.customerId);
                return [{
                    ...job,
                    originalId: job.id,
                    customerName: customer?.primaryContact.name || 'Unknown Customer',
                    technicianName: 'Unassigned',
                    color: '#A0A0A0',
                    isGhost: false,
                }];
            }
            
            const customer = customers.find(c => c.id === job.customerId);
            const jobStart = new Date(job.schedule.start);
            const jobEnd = new Date(job.schedule.end);

            if (isBefore(jobEnd, jobStart)) return [];

            const jobInterval = { start: startOfDay(jobStart), end: endOfDay(jobEnd) };
            const daysInJob = eachDayOfInterval(jobInterval);
            
            return daysInJob.flatMap(day => {
                const dayStart = startOfDay(day);
                
                const segmentStart = new Date(day);
                segmentStart.setHours(jobStart.getHours(), jobStart.getMinutes());
                
                const segmentEnd = new Date(day);
                segmentEnd.setHours(jobEnd.getHours(), jobEnd.getMinutes());
                
                if (isBefore(segmentEnd, segmentStart)) return [];
                
                const allTechsForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);

                return allTechsForJob.map((techId, index) => {
                    const technician = technicians.find(t => t.id === techId);
                    const isPrimary = index === 0;

                    return {
                        ...job,
                        id: `${job.id}-${format(day, 'yyyy-MM-dd')}-${techId}`,
                        originalId: job.id,
                        technicianId: techId,
                        schedule: {
                            ...job.schedule,
                            start: segmentStart,
                            end: segmentEnd,
                        },
                        customerName: customer?.primaryContact.name || 'Unknown Customer',
                        technicianName: technician?.name || 'Unassigned',
                        color: technician?.color || '#A0A0A0',
                        isGhost: !isPrimary,
                    };
                });
            });
        });
    }, [jobs, customers, technicians]);


  const scheduledJobs = enrichedJobs.filter(job => job.status !== 'unscheduled');
  const unscheduledJobs = enrichedJobs.filter(job => job.status === 'unscheduled');

  if (loading) {
    return <div className="p-4">Loading Schedule...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
          <ScheduleView
              jobs={scheduledJobs}
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

