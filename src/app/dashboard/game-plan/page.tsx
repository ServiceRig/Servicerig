
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { CheckSquare, Square, AlertTriangle, Lightbulb, UserCog, Briefcase, DollarSign, Route } from 'lucide-react';

const gamePlan = [
    {
        title: 'Change Orders',
        status: 'Partial',
        difficulty: 'Easy',
        icon: Briefcase,
        current: 'A read-only list view is implemented.',
        nextSteps: [
            'Create a "New Change Order" form, likely accessible from a Job Details page.',
            'Implement a server action to create and save the change order, linking it to the job.',
            'Build an edit flow for draft change orders.',
            'Add functionality to approve/reject change orders, changing their status.',
            'Integrate approved change order line items into the invoicing process.',
        ],
    },
    {
        title: 'Leads Management',
        status: 'Partial',
        difficulty: 'Easy',
        icon: Lightbulb,
        current: 'A backend function exists to convert emails to jobs, but there is no UI.',
        nextSteps: [
            'Create a new "Leads" page to display incoming leads (from email or manual entry).',
            'Build a "New Lead" form for manual entry.',
            'Implement a "Convert to Job" or "Convert to Estimate" action on each lead.',
            'Develop a status system for leads (e.g., New, Contacted, Converted, Dead).',
        ],
    },
    {
        title: 'Customer Relationship Management (CRM)',
        status: 'Partial',
        difficulty: 'Medium',
        icon: UserCog,
        current: 'Full CRUD for customers and a detail page showing all related records.',
        nextSteps: [
            'Add a communication log to the customer record (e.g., calls, emails).',
            'Implement a follow-up/task system for sales or customer service.',
            'Create custom fields for customer profiles.',
            'Develop a more advanced tagging system for customer segmentation.',
        ],
    },
    {
        title: 'Service Agreements',
        status: 'Partial',
        difficulty: 'Medium',
        icon: CheckSquare,
        current: 'A list view with status toggles is present.',
        nextSteps: [
            'Build "New" and "Edit" pages for creating detailed service agreements (covered equipment, frequency, price).',
            'Implement a backend scheduled function (cron job) that runs daily.',
            'This function will check for agreements with a `nextDueDate` of today.',
            'When a due date matches, the function will automatically generate a new, unscheduled job linked to that agreement.',
            'If auto-invoicing is enabled, generate and send the corresponding invoice.',
        ],
    },
     {
        title: 'Job Costing',
        status: 'Partial',
        difficulty: 'Hard',
        icon: DollarSign,
        current: 'Parts can be logged against a job.',
        nextSteps: [
            'Implement a full time-tracking system for technicians to log hours against specific jobs.',
            'Create a system to define technician labor rates (burden cost).',
            'On the Job Details page, create a "Job Costing" tab that aggregates the total cost of all used parts and all logged labor.',
            'Compare the final job cost against the total invoice amount to calculate profitability per job.',
        ],
    },
    {
        title: 'Optimized Routing',
        status: 'Partial',
        difficulty: 'Hard',
        icon: Route,
        current: "Technician's schedule page can open Google Maps with an optimized route link.",
        nextSteps: [
            'Integrate with a mapping provider\'s API (e.g., Google Maps Directions API).',
            'Create a "Route Planner" tool for dispatchers.',
            'The tool will take a list of jobs for the day and a list of technicians.',
            'Use the API\'s waypoint optimization to calculate the most efficient route and job order.',
            'Visualize the proposed route on a map and allow dispatchers to confirm and assign the optimized schedule.',
        ],
    },
];

export default function GamePlanPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-3xl font-bold">Development Game Plan</h1>
                    <p className="text-muted-foreground">
                        A strategic to-do list to enhance ServiceRig, ordered from easiest to most complex.
                    </p>
                </div>
                 <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>

            <div className="space-y-6">
                {gamePlan.map((feature, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <feature.icon className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                                    <CardDescription>Difficulty: <span className="font-semibold">{feature.difficulty}</span></CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Current State</h4>
                                <p className="text-muted-foreground">{feature.current}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg mb-2">Path to Completion</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {feature.nextSteps.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
