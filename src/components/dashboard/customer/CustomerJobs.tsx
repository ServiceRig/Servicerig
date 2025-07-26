
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, UserRole } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { cn, getJobStatusStyles } from "@/lib/utils";
import { useRole } from "@/hooks/use-role";

export function CustomerJobs({ jobs }: { jobs: (Job & { technicianName?: string })[] }) {
  const { role } = useRole();
  const getHref = (jobId: string) => `/dashboard/jobs/${jobId}?role=${role || UserRole.Admin}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs & Service History</CardTitle>
        <CardDescription>All jobs for this customer.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{format(new Date(job.schedule.start), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.technicianName}</TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getJobStatusStyles(job.status))}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={getHref(job.id)}>View Job</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">No jobs found for this customer.</p>
        )}
      </CardContent>
    </Card>
  );
}
