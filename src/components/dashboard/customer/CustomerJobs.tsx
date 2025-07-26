
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Job } from "@/lib/types";

export function CustomerJobs({ jobs }: { jobs: (Job & { technicianName: string })[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs</CardTitle>
        <CardDescription>All jobs for this customer.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">Jobs coming soon.</p>
      </CardContent>
    </Card>
  );
}
