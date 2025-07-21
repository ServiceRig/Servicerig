
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Vendor } from '@/lib/types';
import { Pencil } from 'lucide-react';

interface VendorTableProps {
    vendors: Vendor[];
    onEdit: (vendor: Vendor) => void;
}

export function VendorTable({ vendors, onEdit }: VendorTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.contactName || 'N/A'}</TableCell>
                        <TableCell>{vendor.phone || 'N/A'}</TableCell>
                        <TableCell>{vendor.email || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(vendor)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
