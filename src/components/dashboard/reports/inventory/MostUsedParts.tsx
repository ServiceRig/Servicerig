
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import type { PartUsageLog, InventoryItem, Technician } from '@/lib/types';

type PartUsageSummary = {
    partId: string;
    partName: string;
    trade: string;
    totalUsed: number;
};

export function MostUsedParts() {
    const [logs, setLogs] = useState<PartUsageLog[]>(mockData.partUsageLogs);
    const [technicians, setTechnicians] = useState<Technician[]>(mockData.technicians);

    const [tradeFilter, setTradeFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');
    const [timePeriod, setTimePeriod] = useState('all');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const part = mockData.inventoryItems.find(p => p.id === log.partId);
            const matchesTrade = tradeFilter === 'all' || (part && part.trade === tradeFilter);
            const matchesTech = techFilter === 'all' || log.technicianId === techFilter;
            // Add time period filtering logic here
            return matchesTrade && matchesTech;
        });
    }, [logs, tradeFilter, techFilter, timePeriod]);

    const usageSummary = useMemo(() => {
        const summaryMap = new Map<string, PartUsageSummary>();
        filteredLogs.forEach(log => {
            const part = mockData.inventoryItems.find(p => p.id === log.partId);
            if (!part) return;

            let entry = summaryMap.get(log.partId);
            if (!entry) {
                entry = { partId: log.partId, partName: part.name, trade: part.trade, totalUsed: 0 };
            }
            entry.totalUsed += log.quantity;
            summaryMap.set(log.partId, entry);
        });
        return Array.from(summaryMap.values()).sort((a, b) => b.totalUsed - a.totalUsed);
    }, [filteredLogs]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Most Used Parts</CardTitle>
                <CardDescription>Analyze part consumption by trade, technician, and time.</CardDescription>
                <div className="flex gap-2 pt-4">
                     <Select value={tradeFilter} onValueChange={setTradeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Trade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Trades</SelectItem>
                            <SelectItem value="HVAC">HVAC</SelectItem>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={techFilter} onValueChange={setTechFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Technician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Technicians</SelectItem>
                            {technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part</TableHead>
                            <TableHead>Trade</TableHead>
                            <TableHead className="text-right">Total Used</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usageSummary.slice(0, 10).map(item => ( // Show top 10
                            <TableRow key={item.partId}>
                                <TableCell className="font-medium">{item.partName}</TableCell>
                                <TableCell>{item.trade}</TableCell>
                                <TableCell className="text-right font-bold">{item.totalUsed}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
