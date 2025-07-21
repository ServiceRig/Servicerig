
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockData } from "@/lib/mock-data";
import type { EstimateTemplate } from '@/lib/types';
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function EstimateTemplatesPageContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [templates, setTemplates] = useState<EstimateTemplate[]>([]);

    useEffect(() => {
        // Simulating data fetch
        setTemplates(mockData.estimateTemplates as EstimateTemplate[]);
    }, []);

    const getHref = (path: string) => {
        return role ? `${path}?role=${role}` : path;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Estimate Templates</h1>
                    <p className="text-muted-foreground">Create and manage reusable templates for common jobs.</p>
                </div>
                <Button asChild>
                    <Link href={getHref("/dashboard/settings/estimates/new")}>
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
                                            <Link href={getHref(`/dashboard/settings/estimates/${template.id}/edit`)}>Edit</Link>
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

export default function EstimateTemplatesPage() {
    return (
        <Suspense fallback={<div>Loading templates...</div>}>
            <EstimateTemplatesPageContent />
        </Suspense>
    )
}
