
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEstimateTemplates } from "@/lib/firestore/templates";
import { Plus } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Don't cache this page

export default async function EstimateTemplatesPage() {
    const templates = await getEstimateTemplates();
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Estimate Templates</h1>
                    <p className="text-muted-foreground">Create and manage reusable templates for common jobs.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/settings/estimates/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Templates</CardTitle>
                    <CardDescription>{templates.length} templates available.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Line Items</TableHead>
                                <TableHead>Has GBB Tiers</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.title}</TableCell>
                                    <TableCell>{template.lineItems.length}</TableCell>
                                    <TableCell>{template.gbbTier ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/settings/estimates/${template.id}/edit`}>Edit</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
