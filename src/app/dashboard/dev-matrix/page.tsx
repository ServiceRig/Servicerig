
'use client';

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
        { name: "Scheduling", status: "Implemented", notes: "Full drag-and-drop interface for daily, weekly, and per-technician views. Supports unscheduled jobs." },
        { name: "Dispatch", status: "Implemented", notes: "Core functionality is handled via the scheduling board." },
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
                            <AccordionContent className="space-y-2 pt-2 text-base">
                                <p>This application is a Next.js-based Field Service Management (FSM) platform called ServiceRig. It uses React with functional components and hooks, TypeScript for type safety, and ShadCN UI with Tailwind CSS for the user interface.</p>
                                <p>For backend operations and data persistence, the app currently simulates a Firestore database using a mutable, in-memory object (`mockData`). All data fetching and mutation logic is centralized in files within `src/lib/firestore/` and exposed via Server Actions in `src/app/actions.ts`. This simulation is a major source of recurring issues.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-semibold">Recurring Issues & Architectural Challenges</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2 text-base">
                                <div className="p-4 border-l-4 border-destructive bg-destructive/10">
                                    <h4 className="font-bold text-destructive-foreground">Primary Issue: State Management & Data Synchronization</h4>
                                    <p className="mt-2 text-destructive-foreground/90">The most persistent problem in this codebase is the failure to reliably synchronize the client-side UI state with the backend `mockData` after a server action completes. This manifests as a user performing an action (e.g., "Add Field Purchase"), seeing a "Success" message, but the new item not appearing in the UI without a manual page refresh.</p>
                                    <h5 className="font-semibold mt-3">Root Causes:</h5>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li><strong>Broken Callback Chains:</strong> Incorrectly passing or naming callback props (e.g., `onDataUpdate`, `onPurchaseLogged`) from parent to child components, severing the update notification path.</li>
                                        <li><strong>State Scope:</strong> Server Actions modify the central `mockData`, but the client component's state (e.g., `inventoryItems` in `InventoryPage`) is a stale copy and is not correctly refreshed with the updated data.</li>
                                        <li><strong>Incorrect Action Responses:</strong> Server actions sometimes crashed or used `redirect()`, which is incompatible with `useActionState`, causing an "Unexpected response" error on the client.</li>
                                    </ul>
                                     <h5 className="font-semibold mt-3">The Correct Pattern (to be enforced):</h5>
                                    <ol className="list-decimal pl-5 mt-1 space-y-1 font-mono text-sm">
                                        <li>The main feature page (e.g., `InventoryPage`) owns the state (`useState`).</li>
                                        <li>Server Actions modify backend data and **return the complete updated dataset**.</li>
                                        <li>Child components (e.g., a dialog) trigger the action and use a callback prop to pass the new dataset up to the parent page.</li>
                                        <li>The parent page's callback updates its state with the new dataset, triggering a re-render of all children.</li>
                                    </ol>
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
