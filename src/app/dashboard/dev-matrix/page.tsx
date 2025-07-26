
'use client';

import { useState, useEffect, useMemo } from 'react';
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

const dailyChangeLog = [
    { date: 'July 19, 2024', summary: 'Corrected a state management flaw in the scheduler where the "To Be Scheduled" list was not updating, causing subsequent drag-and-drop operations to fail after the first successful one. Refactored the component to ensure it always receives fresh props.', time: '3.0 hrs' },
    { date: 'July 18, 2024', summary: 'Addressed a TypeError in the scheduler\'s drop handler by correcting the data payload passed by the `DraggableJob` component, ensuring drop operations succeed reliably. Removed a visual bug where the "ghost" preview of a job would remain on the board after being dropped.', time: '4.5 hrs' },
    { date: 'July 17, 2024', summary: 'Fixed handling for unassigned jobs on the weekly and daily schedule views. Implemented the initial version of the daily change log on the Dev Matrix page.', time: '3.5 hrs' },
    { date: 'July 16, 2024', summary: 'Removed corrupted mock job data that was causing UI errors. Began work on the Dev Matrix page to track feature implementation status.', time: '2.5 hrs' },
    { date: 'July 15, 2024', summary: 'Created the Purchase Order details page and the "New Purchase Order" flow, allowing users to generate POs from the shopping list.', time: '5.0 hrs' },
    { date: 'July 12, 2024', summary: 'Implemented the "Shopping List" feature, which automatically aggregates parts needed based on reorder thresholds and technician requests. Added various inventory reports for most-used parts and vendor price trends.', time: '6.0 hrs' },
    { date: 'July 11, 2024', summary: 'Developed the "My Schedule" page for technicians, including job cards and a list of today\'s appointments. Integrated the Field Purchase Dialog.', time: '5.5 hrs' },
    { date: 'July 10, 2024', summary: 'Built out the full Inventory management page with multiple tabs for different user roles (Warehouse, Truck Stock, Equipment Logs, etc.). Added dialogs for issuing stock and logging equipment service.', time: '7.0 hrs' },
    { date: 'July 9, 2024', summary: 'Created the Invoice Aging and Technician Earnings reports. Implemented mock KPI calculation service to populate the main reports dashboard.', time: '6.5 hrs' },
    { date: 'July 8, 2024', summary: 'Developed the main KPI dashboard page, including the profitability chart and stat card components. Set up placeholder integration cards for third-party services like QuickBooks and Stripe.', time: '5.0 hrs' },
    { date: 'July 5, 2024', summary: 'Built the settings section, including pages for User Management, Vendor Catalog, and Estimate Templates. Implemented the AI Vendor Finder tool.', time: '6.0 hrs' },
    { date: 'July 3, 2024', summary: 'Implemented the AI Price Generator and the main Price Book page, allowing for manual and AI-powered creation of service items.', time: '5.5 hrs' },
    { date: 'July 2, 2024', summary: 'Developed the "New Estimate" page, including the AI Tier Generator and the Customer Presentation View. Created server actions for estimate creation.', time: '7.0 hrs' },
    { date: 'July 1, 2024', summary: 'Created the detailed Invoice view page, including payment and refund dialogs, and the public, token-secured view for customers.', time: '6.0 hrs' },
    { date: 'June 28, 2024', summary: 'Implemented the main Invoicing dashboard with search, filtering, and summary statistics. Created the "New Invoice" page flow.', time: '6.5 hrs' },
    { date: 'June 27, 2024', summary: 'Built the detailed Customer view page, aggregating jobs, estimates, equipment, and financial totals for a single customer. Added the Edit Customer dialog.', time: '5.0 hrs' },
    { date: 'June 26, 2024', summary: 'Developed the main Customers list page. Refined the core layout, navigation, and role-based access control for menu items.', time: '4.5 hrs' },
    { date: 'June 25, 2024', summary: 'Began implementation of the core scheduling functionality. Created the main `ScheduleView` component and the `DraggableJob` component. Set up the drag-and-drop context using react-dnd.', time: '7.5 hrs' },
    { date: 'June 24, 2024', summary: 'Initial project setup. Configured Next.js, TypeScript, Tailwind CSS, and ShadCN UI. Created the main dashboard layout, sidebar navigation, and authentication flow.', time: '6.0 hrs' },
];

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
                                <div>
                                    <p>This application is a Next.js-based Field Service Management (FSM) platform called ServiceRig. It uses React with functional components and hooks, TypeScript for type safety, and ShadCN UI with Tailwind CSS for the user interface. Recent development has focused heavily on refining the core user experience of the scheduling module.</p>
                                    <p className="mt-2">For backend operations and data persistence, the app currently simulates a Firestore database using a mutable, in-memory object (`mockData`). All data fetching and mutation logic is centralized in files within `src/lib/firestore/` and exposed via Server Actions in `src/app/actions.ts`. This simulation is a major source of recurring issues but allows for rapid UI development.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-semibold">Recent Work Summary & Architectural Challenges</AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-2 text-base">
                                <div className="p-4 border-l-4 border-blue-300 bg-blue-50">
                                     <h4 className="font-bold text-blue-800">Focus: Robust Drag-and-Drop Scheduling & Ghosting Preview</h4>
                                     <p className="mt-2 text-blue-900/90">The latest development cycles have been dedicated to fixing a persistent and critical bug in the scheduling board's drag-and-drop functionality and refining the UI to be more intuitive.</p>
                                     <h5 className="font-semibold mt-3">Key Challenge: State Desynchronization on Drop</h5>
                                     <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li><strong>Symptom:</strong> After dragging a job from the "To Be Scheduled" list and dropping it onto the calendar, the "ghost" preview would sometimes remain, the original item would not be removed from the list, or the drop would fail entirely.</li>
                                        <li><strong>Root Cause Analysis:</strong> The root cause was multifaceted, involving stale state in the `ToBeScheduledList` component and an incomplete data payload being passed by the `DraggableJob` component. The drop handler (`handleJobDrop`) would receive incorrect data, causing the state update to fail silently.</li>
                                        <li><strong>Solution:</strong> The fix involved refactoring the `ToBeScheduledList` to receive its data via props rather than managing its own state, ensuring it always has the latest job list. Additionally, the `DraggableJob` component's `useDrag` hook was corrected to pass the complete `originalData` object in its payload, providing the drop handler with all necessary information to perform the update.</li>
                                     </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Change Log</CardTitle>
                    <CardDescription>A summary of recent development activity and approximate time spent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Summary of Changes</TableHead>
                                <TableHead className="w-[120px] text-right">Est. Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dailyChangeLog.map((log) => (
                                <TableRow key={log.date}>
                                    <TableCell className="font-medium">{log.date}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{log.summary}</TableCell>
                                    <TableCell className="text-right font-mono">{log.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
