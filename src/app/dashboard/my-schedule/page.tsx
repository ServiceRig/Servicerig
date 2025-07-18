
import { Wrench } from "lucide-react";

export default function MySchedulePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold flex items-center"><Wrench className="mr-2 h-6 w-6" /> My Schedule</h1>
      <p>This page will show the currently logged-in technician their assigned jobs for the day and week.</p>
      <p className="text-muted-foreground">Coming Soon</p>
    </div>
  );
}
