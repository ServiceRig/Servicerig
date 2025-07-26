
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Job } from "@/lib/types";
import { DraggableJob } from "../dnd/DraggableJob";

interface ToBeScheduledListProps {
  jobs: (Job & { customerName?: string })[];
}

export function ToBeScheduledList({ jobs }: ToBeScheduledListProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>To Be Scheduled</CardTitle>
        <CardDescription>Drag a job onto the calendar to schedule it.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-2">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-2">
            {jobs.length > 0 ? (
              jobs.map(job => {
                  const itemForDnd = {
                    ...job,
                    id: job.id,
                    originalId: job.id,
                    start: new Date(job.schedule.start),
                    end: new Date(job.schedule.end),
                    customerName: job.customerName || 'Unknown Customer',
                    technicianName: 'Unassigned',
                    type: 'job' as const,
                    originalData: { ...job, type: 'job' }
                };

                return (
                    <DraggableJob key={job.id} item={itemForDnd}>
                      <div className="p-3 border rounded-md cursor-grab bg-secondary hover:bg-muted transition-colors">
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.customerName}</p>
                      </div>
                    </DraggableJob>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground text-center py-4">No jobs to schedule.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
