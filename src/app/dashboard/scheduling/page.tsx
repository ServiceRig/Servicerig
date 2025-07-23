

'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockData } from "@/lib/mock-data";
import { Job, Customer, Technician } from "@/lib/types";
import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { addDays, eachDayOfInterval, startOfDay, endOfDay, max, min, isSameDay, setHours, setMinutes, getHours, getMinutes, isAfter, isBefore } from 'date-fns';

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
    const [isFitToScreen, setIsFitToScreen] = useState(false);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
        setJobs(mockData.jobs as Job[]);
        setCustomers(mockData.customers as Customer[]);
        setTechnicians(mockData.technicians as Technician[]);
        setLoading(false);
    }, 500);
  }, []);
  
  const handleJobCreated = useCallback((newJob: Job) => {
    setJobs(prevJobs => {
        if (prevJobs.some(job => job.id === newJob.id)) {
            return prevJobs;
        }
        return [newJob, ...prevJobs];
    });
  }, []);
  
  const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    setJobs(prevJobs => {
        const jobToMove = prevJobs.find(j => j.id === jobId);
        if (!jobToMove) {
            console.error(`Job with id ${jobId} not found!`);
            return prevJobs;
        }

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
        
        const updatedJobs = prevJobs.map(j => 
            j.id === jobId 
            ? { ...j, technicianId: newTechnicianId, schedule: { ...j.schedule, start: snappedStartTime, end: newEndTime }, status: 'scheduled' } 
            : j
        );

        const mockJobIndex = mockData.jobs.findIndex((j: Job) => j.id === jobId);
        if (mockJobIndex !== -1) {
            mockData.jobs[mockJobIndex] = updatedJobs.find(j => j.id === jobId)!;
        }

        return updatedJobs;
    });
  }, []);

  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if(jobIndex === -1) {
        console.error(`Job with id ${jobId} not found for status update.`);
        return;
    }
    
    let updatedJob = { ...jobs[jobIndex], status: newStatus };
    const newJobs = [...jobs];
    newJobs[jobIndex] = updatedJob;
    setJobs(newJobs);

    const mockJobIndex = mockData.jobs.findIndex((mockJ: Job) => mockJ.id === jobId);
    if (mockJobIndex !== -1) {
        mockData.jobs[mockJobIndex] = updatedJob;
    }
  }, [jobs]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week');

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const increment = activeView === 'day' ? 1 : 7;
    const sign = direction === 'prev' ? -1 : 1;
    setCurrentDate(prevDate => addDays(prevDate, increment * sign));
  };
  
    const { startHour: workdayStartHour, endHour: workdayEndHour } = mockData.scheduleSettings;

    const enrichedJobs = (jobs ?? []).flatMap(job => {
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

        const jobInterval = { start: jobStart, end: jobEnd };
        const daysInJob = eachDayOfInterval(jobInterval);
        
        return daysInJob.flatMap(day => {
            const dayStart = startOfDay(day);
            const dayEnd = endOfDay(day);

            const effectiveDayStart = setMinutes(setHours(dayStart, workdayStartHour), 0);
            const effectiveDayEnd = setMinutes(setHours(dayStart, workdayEndHour), 0);

            const visibleStart = isSameDay(day, jobStart) ? jobStart : effectiveDayStart;
            const visibleEnd = isSameDay(day, jobEnd) ? jobEnd : effectiveDayEnd;
            
            if (isBefore(visibleEnd, visibleStart)) return [];

            const allTechsForJob = [job.technicianId, ...(job.additionalTechnicians || [])].filter(Boolean);

            return allTechsForJob.map((techId, index) => {
                const technician = technicians.find(t => t.id === techId);
                const isPrimary = index === 0;

                return {
                    ...job,
                    id: `${job.id}_${format(day, 'yyyy-MM-dd')}_${techId}`,
                    originalId: job.id,
                    technicianId: techId,
                    schedule: {
                        ...job.schedule,
                        start: visibleStart,
                        end: visibleEnd,
                    },
                    customerName: customer?.primaryContact.name || 'Unknown Customer',
                    technicianName: technician?.name || 'Unassigned',
                    color: technician?.color || '#A0A0A0',
                    isGhost: !isPrimary,
                };
            });
        });
    });


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
