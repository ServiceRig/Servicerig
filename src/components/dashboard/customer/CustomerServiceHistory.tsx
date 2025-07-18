
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/types";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

const getStatusStyles = (status: Job['status']) => {
  switch (status) {
    case 'in_progress':
      return 'bg-yellow-500 text-white';
    case 'complete':
      return 'bg-green-500 text-white';
    case 'scheduled':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function CustomerServiceHistory({ jobs }: { jobs: (Job & { technicianName: string })[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service History</CardTitle>
        <CardDescription>A complete history of jobs for this customer.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job</TableHead>
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
                    <Badge className={cn("capitalize", getStatusStyles(job.status))}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/jobs/${job.id}`}>View Job</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No service history found.</p>
        )}
      </CardContent>
    </Card>
  );
}
