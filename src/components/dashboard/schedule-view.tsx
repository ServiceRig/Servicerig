'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockJobs, mockTechnicians } from "@/lib/mock-data";
import { Job } from "@/lib/types";

const JobCard = ({ job }: { job: Job }) => (
    <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg text-sm cursor-pointer hover:bg-primary/20 transition-colors">
        <p className="font-bold text-primary">{job.details.serviceType}</p>
        <p className="text-xs text-muted-foreground">{mockTechnicians.find(t => t.id === job.technicianId)?.name}</p>
        <p className="text-xs text-muted-foreground">{job.schedule.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {job.schedule.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
)

const DayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTechnicians.map(tech => (
                <div key={tech.id}>
                    <h3 className="font-semibold text-center mb-2">{tech.name}</h3>
                    <div className="relative border rounded-lg p-2 h-96 overflow-y-auto bg-background">
                         <div className="space-y-2">
                            {mockJobs.filter(j => j.technicianId === tech.id).map(job => (
                                <JobCard key={job.id} job={job}/>
                            ))}
                         </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

const WeekView = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return (
        <div className="grid grid-cols-5 gap-2">
            {days.map(day => (
                <div key={day}>
                    <h3 className="font-semibold text-center mb-2">{day}</h3>
                    <div className="border rounded-lg p-2 h-72 overflow-y-auto space-y-2 bg-background">
                         {mockJobs.filter(j => j.schedule.start.getDay() === (days.indexOf(day) + 1)).slice(0, 3).map(job => (
                            <JobCard key={job.id} job={job}/>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


export function ScheduleView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduling</CardTitle>
        <CardDescription>Manage and view job schedules.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Daily View</TabsTrigger>
            <TabsTrigger value="week">Weekly View</TabsTrigger>
            <TabsTrigger value="technician">Technician View</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="mt-4">
            <DayView />
          </TabsContent>
          <TabsContent value="week" className="mt-4">
            <WeekView />
          </TabsContent>
          <TabsContent value="technician" className="mt-4">
            <DayView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
