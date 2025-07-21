

'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Vendor } from '@/lib/types';
import { Pencil, Star, Link as LinkIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface VendorTableProps {
    vendors: Vendor[];
    onEdit: (vendor: Vendor) => void;
}

export function VendorTable({ vendors, onEdit }: VendorTableProps) {
    return (
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Trades</TableHead>
                        <TableHead>Portal</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                {vendor.name}
                                {vendor.preferred && (
                                     <Tooltip>
                                        <TooltipTrigger>
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                                        </TooltipTrigger>
                                        <TooltipContent><p>Preferred Vendor</p></TooltipContent>
                                    </Tooltip>
                                )}
                            </TableCell>
                            <TableCell>{vendor.contactName || 'N/A'}</TableCell>
                            <TableCell>{vendor.phone || 'N/A'}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {(vendor.trades || []).map(trade => (
                                        <Badge key={trade} variant="secondary">{trade}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                             <TableCell>
                                {vendor.portalUrl ? (
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={vendor.portalUrl} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(vendor)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {vendors.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No vendors found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TooltipProvider>
    );
}
