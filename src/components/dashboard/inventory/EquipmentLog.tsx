
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockData } from '@/lib/mock-data';
import type { EquipmentLog } from '@/lib/types';
import { format } from 'date-fns';

const getLogTypeStyles = (type: EquipmentLog['type']) => {
  switch (type) {
    case 'inspection': return 'bg-blue-500 text-white';
    case 'repair': return 'bg-yellow-500 text-white';
    case 'usage': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export function EquipmentLog({ searchTerm }: { searchTerm: string }) {
    const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLog[]>(() => {
        return mockData.equipmentLogs.map(log => {
            const equipment = mockData.equipment.find(e => e.id === log.equipmentId);
            const technician = mockData.technicians.find(t => t.id === log.technicianId);
            return {
                ...log,
                equipmentName: equipment?.name || 'Unknown Equipment',
                technicianName: technician?.name || 'Unknown User',
            };
        });
    });

    const [equipmentFilter, setEquipmentFilter] = useState('all');
    const [technicianFilter, setTechnicianFilter] = useState('all');

    const filteredLogs = useMemo(() => {
        return equipmentLogs.filter(log => {
            const lowercasedTerm = searchTerm.toLowerCase();
            const matchesSearch = searchTerm ? (
                log.notes.toLowerCase().includes(lowercasedTerm) ||
                (log.equipmentName && log.equipmentName.toLowerCase().includes(lowercasedTerm))
            ) : true;
            const matchesEquipment = equipmentFilter === 'all' || log.equipmentId === equipmentFilter;
            const matchesTechnician = technicianFilter === 'all' || log.technicianId === technicianFilter;
            return matchesSearch && matchesEquipment && matchesTechnician;
        });
    }, [equipmentLogs, searchTerm, equipmentFilter, technicianFilter]);
    
    const uniqueEquipment = useMemo(() => Array.from(new Map(equipmentLogs.map(log => [log.equipmentId, {id: log.equipmentId, name: log.equipmentName}])).values()), [equipmentLogs]);
    const uniqueTechnicians = useMemo(() => Array.from(new Map(equipmentLogs.map(log => [log.technicianId, {id: log.technicianId, name: log.technicianName}])).values()), [equipmentLogs]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Equipment Log</CardTitle>
                <CardDescription>A complete history of all tool and equipment usage, repairs, and inspections.</CardDescription>
                <div className="flex gap-2 pt-4">
                     <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Equipment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Equipment</SelectItem>
                            {uniqueEquipment.map(e => <SelectItem key={e.id} value={e.id || ''}>{e.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Technician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Technicians</SelectItem>
                             {uniqueTechnicians.map(t => <SelectItem key={t.id} value={t.id || ''}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Equipment</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                                <TableCell className="font-medium">{log.equipmentName}</TableCell>
                                <TableCell>{log.technicianName}</TableCell>
                                <TableCell><Badge className={getLogTypeStyles(log.type)}>{log.type}</Badge></TableCell>
                                <TableCell>{log.notes}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center">No logs found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
