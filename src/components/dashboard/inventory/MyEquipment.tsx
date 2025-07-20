
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockData } from '@/lib/mock-data';
import type { Equipment } from '@/lib/types';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogEquipmentServiceDialog } from './LogEquipmentServiceDialog';

const LOGGED_IN_TECHNICIAN_ID = 'tech1';

const getConditionStyles = (condition: Equipment['condition']) => {
  switch (condition) {
    case 'new':
    case 'good':
      return 'bg-green-500 text-white';
    case 'fair':
      return 'bg-yellow-500 text-white';
    case 'poor':
    case 'decommissioned':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function MyEquipment({ searchTerm }: { searchTerm: string }) {
    const [equipment, setEquipment] = useState<Equipment[]>(() => {
        return mockData.equipment.filter(eq => eq.technicianId === LOGGED_IN_TECHNICIAN_ID);
    });

    const filteredEquipment = useMemo(() => {
        if (!searchTerm) return equipment;
        const lowercasedTerm = searchTerm.toLowerCase();
        return equipment.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm) ||
            item.make.toLowerCase().includes(lowercasedTerm) ||
            item.model.toLowerCase().includes(lowercasedTerm) ||
            item.serial.toLowerCase().includes(lowercasedTerm)
        );
    }, [equipment, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Equipment</CardTitle>
                <CardDescription>A list of all tools and devices currently assigned to you.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Serial #</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEquipment.length > 0 ? filteredEquipment.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.serial}</TableCell>
                                <TableCell>
                                    <Badge className={cn('capitalize', getConditionStyles(item.condition))}>
                                        {item.condition}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                     <LogEquipmentServiceDialog equipment={item} technicianId={LOGGED_IN_TECHNICIAN_ID} />
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No equipment found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
