
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockCustomers, mockJobs, mockTechnicians } from "@/lib/mock-data";
import { Job, Customer, Technician } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { addDays, isSameDay } from 'date-fns';

// This is a placeholder for a real Firestore hook
const useMockFirestore = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [technicians, setTechnicians] = useState<Technician[]>(mockTechnicians);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  
  const moveJob = useCallback((jobId: string, newTechnicianId: string, newStartTime: Date) => {
    setJobs(prevJobs => {
        const jobToMove = prevJobs.find(j => j.id === jobId);
        if (!jobToMove) return prevJobs;

        const duration = jobToMove.schedule.end.getTime() - jobToMove.schedule.start.getTime();
        const newEndTime = new Date(newStartTime.getTime() + duration);

        return prevJobs.map(j => 
            j.id === jobId 
            ? { ...j, technicianId: newTechnicianId, schedule: { start: newStartTime, end: newEndTime }, status: 'scheduled' } 
            : j
        );
    });
    // In a real app, you would update Firestore here.
    console.log(`Moved job ${jobId} to tech ${newTechnicianId} at ${newStartTime}`);
  }, []);

  const updateJobStatus = useCallback((jobId: string, newStatus: Job['status']) => {
    setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
     console.log(`Updated job ${jobId} status to ${newStatus}`);
  }, []);

  return { 
    jobs, 
    customers, 
    technicians, 
    loading, 
    moveJob,
    updateJobStatus
  };
};

export default function SchedulingPage() {
  const { jobs, customers, technicians, loading, moveJob, updateJobStatus } = useMockFirestore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const enrichedJobs = jobs.map(job => {
    const customer = customers.find(c => c.id === job.customerId);
    const technician = technicians.find(t => t.id === job.technicianId);
    return {
      ...job,
      customerName: customer?.primaryContact.name || 'Unknown Customer',
      technicianName: technician?.name || 'Unassigned',
    };
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
              currentDate={currentDate}
              onCurrentDateChange={setCurrentDate}
          />
      </div>
    </DndProvider>
  );
}
