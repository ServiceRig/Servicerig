
'use client';

import { ScheduleView } from "@/components/dashboard/schedule-view";
import { mockCustomers, mockJobs, mockTechnicians } from "@/lib/mock-data";
import { Job, Customer, Technician, UserRole } from "@/lib/types";
import { useEffect, useState } from "react";

// This is a placeholder for a real Firestore hook
const useFirestoreCollection = <T,>(data: T[]) => {
  const [collectionData, setCollectionData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCollectionData(data);
      setLoading(false);
    }, 500);
  }, [data]);

  return { data: collectionData, loading };
}


export default function SchedulingPage() {
  const { data: jobs, loading: jobsLoading } = useFirestoreCollection<Job>(mockJobs);
  const { data: customers, loading: customersLoading } = useFirestoreCollection<Customer>(mockCustomers);
  const { data: technicians, loading: techniciansLoading } = useFirestoreCollection<Technician>(mockTechnicians);

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


  if (jobsLoading || customersLoading || techniciansLoading) {
    return <div className="p-4">Loading Schedule...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
        <ScheduleView
            jobs={scheduledJobs}
            unscheduledJobs={unscheduledJobs}
            technicians={technicians}
        />
    </div>
  );
}
