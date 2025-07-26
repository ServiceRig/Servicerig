
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FeatureStatus = 'Implemented' | 'Partial' | 'Not Implemented';

interface Feature {
    name: string;
    status: FeatureStatus;
    notes: string;
}

const featureMatrix: Record<string, Feature[]> = {
    "Front Office": [
        { name: "Proposals & Quotes", status: "Implemented", notes: "Full CRUD via Estimates module. Includes manual creation, AI generation, and template-based creation." },
        { name: "Service Agreements", status: "Partial", notes: "Basic list view and status toggling exists. Full creation/editing and automated job creation from agreements is not implemented." },
        { name: "Scheduling", status: "Implemented", notes: "Robust drag-and-drop interface for daily/weekly views. Features a 'ghost' preview for precise placement and dynamic state updates on drop, resolving prior sync issues." },
        { name: "Dispatch", status: "Implemented", notes: "Core functionality is handled via the scheduling board. The refined drag-and-drop makes dispatching unscheduled jobs highly intuitive." },
        { name: "Leads", status: "Not Implemented", notes: "No lead management system currently exists." },
        { name: "Call Recording", status: "Not Implemented", notes: "" },
        { name: "Change Orders", status: "Partial", notes: "Basic list view is implemented, but no creation or editing flow exists. Cannot be linked to invoices yet." },
        { name: "Estimates", status: "Implemented", notes: "Robust implementation. See 'Proposals & Quotes'." },
        { name: "Office Timesheets", status: "Not Implemented", notes: "" },
        { name: "Optimized Routing", status: "Not Implemented", notes: "Map view is a placeholder image. No routing logic." },
    ],
    "Field Operations": [
        { name: "Technician App", status: "Partial", notes: "The 'My Schedule' page serves as the main view. Field purchasing and parts usage logging are implemented." },
        { name: "Inventory App", status: "Implemented", notes: "Technician can view truck stock, request parts, and log field purchases." },
        { name: "Equipment History", status: "Partial", notes: "Equipment is viewable on the customer page. A full history log is not yet available." },
        { name: "Crew Management", status: "Not Implemented", notes: "" },
        { name: "Dynamic Forms", status: "Not Implemented", notes: "" },
        { name: "Truck Replenishment", status: "Partial", notes: "Shopping list is generated from reorder thresholds and tech requests, but automation is pending." },
        { name: "Field Estimates", status: "Implemented", notes: "Technicians can create estimates via the 'New Estimate' page, including using the AI Tier Generator." },
        { name: "GPS Tracking", status: "Not Implemented", notes: "Map is a placeholder." },
        { name: "Purchasing", status: "Implemented", notes: "Field Purchase Dialog allows techs to log purchases on the go." },
    ],
    "Client Experience": [
        { name: "Client Portal", status: "Partial", notes: "A public, token-secured invoice view page exists. No central portal for customers to log in." },
        { name: "Technician Tracking", status: "Not Implemented", notes: "" },
        { name: "Client Specific Pricing", status: "Not Implemented", notes: "" },
        { name: "Two Way SMS", status: "Not Implemented", notes: "" },
        { name: "Self Scheduling & Payments", status: "Partial", notes: "Stripe payment button is present on public invoice but is a placeholder. No self-scheduling." },
        { name: "CRM", status: "Partial", notes: "Basic customer list and detail view are implemented. No advanced CRM features." },
    ],
    "Management and Insight": [
        { name: "Accounting", status: "Not Implemented", notes: "No direct accounting features. Placeholder integration cards for QuickBooks/Xero exist." },
        { name: "Purchase & Inventory", status: "Implemented", notes: "Full system for managing vendors, purchase orders, warehouse stock, and truck stock." },
        { name: "Project Management", status: "Not Implemented", notes: "" },
        { name: "Payroll", status: "Partial", notes: "Technician Earnings report provides commission data, but this is not a full payroll system." },
        { name: "Job Costing", status: "Partial", notes: "Parts can be logged against a job, but labor costs are not yet tracked for true job costing." },
        { name: "Auto Reports & Dashboards", status: "Partial", notes: "Several KPI reports exist (Aging, Tech Earnings, Inventory), but they are not yet automated or fully customizable." },
        { name: "Pricebook", status: "Implemented", notes: "Full UI for managing standard services catalog, including AI-powered price generation." },
        { name: "Procure-To-Pay", status: "Partial", notes: "Procurement (PO system) is built. Payment side is part of the non-existent Accounting module." },
    ],
     "Unique Features & Strengths": [
        { name: "AI-Powered Tiered Estimates", status: "Implemented", notes: "Generates 'Good/Better/Best' options from a job description, a unique feature that helps technicians upsell and provide clear value propositions to customers." },
        { name: "AI Price Generation", status: "Implemented", notes: "Allows office staff to quickly create new, consistently-priced items for the price book based on a description of the work, streamlining catalog expansion." },
        { name: "Integrated Field Purchasing", status: "Implemented", notes: "Technicians can log parts purchased in the field, which automatically creates a PO, updates truck stock, and makes the part available for job costing—a seamless workflow other platforms often handle poorly." },
        { name: "Ghosting Drag-and-Drop Schedule", status: "Implemented", notes: "Our iterative refinement of the scheduling UI resulted in a highly intuitive 'ghosting' preview that shows exactly where a job will land, a significant UX improvement over simple indicators." },
    ],
};

const StatusBadge = ({ status }: { status: FeatureStatus }) => {
    const styles: Record<FeatureStatus, string> = {
        'Implemented': 'bg-green-100 text-green-800 border-green-200',
        'Partial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Not Implemented': 'bg-red-100 text-red-800 border-red-200',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
};

export default function DevMatrixPage() {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const projectStartDate = new Date('2024-06-01T09:00:00Z');
    const [hoursWorked, setHoursWorked] = useState(0);

    useEffect(() => {
        const calculateHours = () => {
            const now = new Date();
            const diffMs = now.getTime() - projectStartDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            setHoursWorked(diffHours);
        }

        calculateHours();
        const interval = setInterval(calculateHours, 1000);

        return () => clearInterval(interval);

    }, [projectStartDate]);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Development Matrix & App Summary</CardTitle>
                    <CardDescription>A reference guide for the app's features, architecture, and known issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-semibold">High-Level Summary</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2 text-base">
                                <div className="font-semibold text-lg text-primary">
                                    <p>Total Hours Worked: {hoursWorked.toFixed(6)}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base mb-1">[{today}]</h4>
                                    <p>The application now features a fully functional drag-and-drop scheduling board. A significant amount of work went into refining this core user experience, resolving several data synchronization bugs, and iterating on the visual feedback to create an intuitive "ghosting" preview. The mock data architecture remains a potential source of issues, but the primary scheduling workflow is now stable.</p>
                                </div>
                                <div className="pl-4 border-l-2 border-slate-200">
                                     <h4 className="font-semibold text-base text-muted-foreground mb-1">[Previous Entry]</h4>
                                    <p className="text-muted-foreground">This application is a Next.js-based Field Service Management (FSM) platform called ServiceRig. It uses React with functional components and hooks, TypeScript for type safety, and ShadCN UI with Tailwind CSS for the user interface. Recent development has focused heavily on refining the core user experience of the scheduling module.</p>
                                    <p className="mt-2 text-muted-foreground">For backend operations and data persistence, the app currently simulates a Firestore database using a mutable, in-memory object (`mockData`). All data fetching and mutation logic is centralized in files within `src/lib/firestore/` and exposed via Server Actions in `src/app/actions.ts`. This simulation is a major source of recurring issues.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-semibold">Recent Work Summary & Architectural Challenges</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-2 text-base">
                                <div className="p-4 border-l-4 border-blue-300 bg-blue-50">
                                     <h4 className="font-bold text-blue-800">Focus: Robust Drag-and-Drop Scheduling & Ghosting Preview [{today}]</h4>
                                     <p className="mt-2 text-blue-900/90">The latest cycle was dedicated to fixing a persistent and critical bug in the scheduling board's drag-and-drop functionality. We also refined the UI to be more intuitive.</p>
                                     <h5 className="font-semibold mt-3">Key Challenge: State Desynchronization on Drop</h5>
                                     <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li><strong>Symptom:</strong> After dragging a job from the "To Be Scheduled" list and dropping it onto the calendar, the "ghost" preview would remain, the original item would not be removed from the list, and the job's state was not updated in the backend.</li>
                                        <li><strong>Root Cause Analysis:</strong> Through console logs, we identified a `TypeError: can't access property "end", itemData is undefined`. This revealed that the `onDrop` event handler was receiving an incomplete data payload. The `originalData` object, which contained the full job details, was not being correctly packaged and passed by the `react-dnd` `useDrag` hook in our `DraggableJob` component.</li>
                                        <li><strong>Solution:</strong> The fix involved modifying the `DraggableJob` component to ensure it consistently includes the `originalData` object within the item payload for the drag operation. Subsequently, the `handleJobDrop` function in the main scheduling page was updated to correctly access this data, preventing the runtime error and allowing the subsequent state updates (updating the job's schedule, clearing the ghost, and removing the job from the staged list) to execute successfully.</li>
                                     </ul>
                                     <h5 className="font-semibold mt-3">Evolving the Visual Feedback</h5>
                                      <p className="mt-1 text-blue-900/90">We iterated several times on the visual feedback for the user during a drag operation. Initial implementations of a thick border or simple highlighting were found to be either too distracting or not clear enough. We settled on the "ghosting" approach, where a semi-transparent preview of the job appears directly on the calendar grid, showing the user exactly where it will land. This provides the most intuitive and precise user experience.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {Object.entries(featureMatrix).map(([category, features]) => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/3">Feature</TableHead>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                    <TableHead>Notes / Known Issues</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {features.map((feature) => (
                                    <TableRow key={feature.name}>
                                        <TableCell className="font-medium">{feature.name}</TableCell>
                                        <TableCell><StatusBadge status={feature.status} /></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{feature.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
