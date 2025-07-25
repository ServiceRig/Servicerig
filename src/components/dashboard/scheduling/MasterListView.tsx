
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn, getJobStatusStyles, getEstimateStatusStyles, getServiceAgreementStatusStyles } from '@/lib/utils';
import type { Job, Estimate, ServiceAgreement, Customer, Technician } from '@/lib/types';
import { useRole } from '@/hooks/use-role';
import { DateRangePicker } from '../date-range-picker';
import type { DateRange } from 'react-day-picker';
import { ArrowUpDown, CalendarCheck, CalendarPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

interface MasterListViewProps {
    jobs: Job[];
    estimates: Estimate[];
    serviceAgreements: ServiceAgreement[];
    customers: Customer[];
    technicians: Technician[];
}

type SortConfig<T> = {
    key: keyof T;
    direction: 'ascending' | 'descending';
} | null;


export function MasterListView({ jobs, estimates, serviceAgreements, customers, technicians }: MasterListViewProps) {
    const { role } = useRole();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    
    const [jobSortConfig, setJobSortConfig] = useState<SortConfig<any>>({ key: 'schedule.start', direction: 'descending'});
    const [estimateSortConfig, setEstimateSortConfig] = useState<SortConfig<any>>({ key: 'createdAt', direction: 'descending' });
    const [agreementSortConfig, setAgreementSortConfig] = useState<SortConfig<any>>({ key: 'billingSchedule.nextDueDate', direction: 'ascending' });
    
    const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());


    const getHref = (path: string) => {
        return role ? `${path}?role=${role}` : path;
    };
    
    const enrichedJobs = useMemo(() => jobs.map(job => ({
        ...job,
        customerName: customers.find(c => c.id === job.customerId)?.primaryContact.name || 'N/A',
        technicianName: technicians.find(t => t.id === job.technicianId)?.name || 'Unassigned',
    })), [jobs, customers, technicians]);

    const enrichedEstimates = useMemo(() => estimates.map(est => ({
        ...est,
        customerName: customers.find(c => c.id === est.customerId)?.primaryContact.name || 'N/A',
    })), [estimates, customers]);

    const enrichedAgreements = useMemo(() => serviceAgreements.map(sa => ({
        ...sa,
        customerName: customers.find(c => c.id === sa.customerId)?.primaryContact.name || 'N/A',
    })), [serviceAgreements, customers]);

    const sortData = (data: any[], config: SortConfig<any>) => {
        if (!config) return data;
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const aValue = config.key.toString().split('.').reduce((o, i) => o?.[i], a);
            const bValue = config.key.toString().split('.').reduce((o, i) => o?.[i], b);

            if (aValue < bValue) {
                return config.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return config.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortedData;
    }

    const requestSort = (key: string, currentConfig: SortConfig<any>, setConfig: React.Dispatch<React.SetStateAction<SortConfig<any>>>) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (currentConfig && currentConfig.key === key && currentConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setConfig({ key, direction } as SortConfig<any>);
    }

    const filteredJobs = useMemo(() => {
        let filtered = enrichedJobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (dateRange?.from) {
            filtered = filtered.filter(job => new Date(job.schedule.start) >= dateRange.from!);
        }
        if (dateRange?.to) {
            filtered = filtered.filter(job => new Date(job.schedule.start) <= dateRange.to!);
        }
        return sortData(filtered, jobSortConfig);
    }, [enrichedJobs, searchTerm, dateRange, jobSortConfig]);
    
    const filteredEstimates = useMemo(() => {
        let filtered = enrichedEstimates.filter(est => est.title.toLowerCase().includes(searchTerm.toLowerCase()) || est.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (dateRange?.from) {
            filtered = filtered.filter(est => new Date(est.createdAt) >= dateRange.from!);
        }
        if (dateRange?.to) {
            filtered = filtered.filter(est => new Date(est.createdAt) <= dateRange.to!);
        }
        return sortData(filtered, estimateSortConfig);
    }, [enrichedEstimates, searchTerm, dateRange, estimateSortConfig]);

    const filteredAgreements = useMemo(() => {
        let filtered = enrichedAgreements.filter(sa => sa.title.toLowerCase().includes(searchTerm.toLowerCase()) || sa.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
         if (dateRange?.from) {
            filtered = filtered.filter(sa => new Date(sa.billingSchedule.nextDueDate) >= dateRange.from!);
        }
        if (dateRange?.to) {
            filtered = filtered.filter(sa => new Date(sa.billingSchedule.nextDueDate) <= dateRange.to!);
        }
        return sortData(filtered, agreementSortConfig);
    }, [enrichedAgreements, searchTerm, dateRange, agreementSortConfig]);
    
    const handleSelectAllJobs = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedJobIds(new Set(filteredJobs.map(job => job.id)));
        } else {
            setSelectedJobIds(new Set());
        }
    };
    
    const handleSelectJob = (jobId: string, checked: boolean) => {
        setSelectedJobIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(jobId);
            } else {
                newSet.delete(jobId);
            }
            return newSet;
        });
    };

    const SortableHeader = ({ title, field, sortConfig, setSortConfig }: { title: string, field: string, sortConfig: SortConfig<any>, setSortConfig: any }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => requestSort(field, sortConfig, setSortConfig)}>
                {title}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </TableHead>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Master Lists</CardTitle>
                <CardDescription>Search and view all jobs, estimates, and service agreements.</CardDescription>
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                    <Input 
                        placeholder="Search across all lists..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                    <DateRangePicker className="max-w-md" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <Button disabled={selectedJobIds.size === 0}>
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule Jobs
                    </Button>
                    <Button variant="outline" disabled={selectedJobIds.size === 0}>
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Reschedule
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="jobs">
                    <TabsList>
                        <TabsTrigger value="jobs">Jobs ({filteredJobs.length})</TabsTrigger>
                        <TabsTrigger value="estimates">Estimates ({filteredEstimates.length})</TabsTrigger>
                        <TabsTrigger value="agreements">Agreements ({filteredAgreements.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="jobs" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length}
                                            onCheckedChange={handleSelectAllJobs}
                                            aria-label="Select all jobs"
                                        />
                                    </TableHead>
                                    <SortableHeader title="Title" field="title" sortConfig={jobSortConfig} setSortConfig={setJobSortConfig} />
                                    <SortableHeader title="Customer" field="customerName" sortConfig={jobSortConfig} setSortConfig={setJobSortConfig} />
                                    <SortableHeader title="Technician" field="technicianName" sortConfig={jobSortConfig} setSortConfig={setJobSortConfig} />
                                    <SortableHeader title="Date" field="schedule.start" sortConfig={jobSortConfig} setSortConfig={setJobSortConfig} />
                                    <SortableHeader title="Status" field="status" sortConfig={jobSortConfig} setSortConfig={setJobSortConfig} />
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map(job => (
                                    <TableRow key={job.id} data-state={selectedJobIds.has(job.id) ? 'selected' : ''}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedJobIds.has(job.id)}
                                                onCheckedChange={(checked) => handleSelectJob(job.id, !!checked)}
                                                aria-label={`Select job ${job.id}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.customerName}</TableCell>
                                        <TableCell>{job.technicianName}</TableCell>
                                        <TableCell>{format(new Date(job.schedule.start), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getJobStatusStyles(job.status))}>{job.status}</Badge></TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={getHref(`/dashboard/jobs/${job.id}`)}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="estimates" className="mt-4">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeader title="Title" field="title" sortConfig={estimateSortConfig} setSortConfig={setEstimateSortConfig} />
                                    <SortableHeader title="Customer" field="customerName" sortConfig={estimateSortConfig} setSortConfig={setEstimateSortConfig} />
                                    <SortableHeader title="Date" field="createdAt" sortConfig={estimateSortConfig} setSortConfig={setEstimateSortConfig} />
                                    <SortableHeader title="Status" field="status" sortConfig={estimateSortConfig} setSortConfig={setEstimateSortConfig} />
                                    <SortableHeader title="Total" field="total" sortConfig={estimateSortConfig} setSortConfig={setEstimateSortConfig} />
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEstimates.map(estimate => (
                                    <TableRow key={estimate.id}>
                                        <TableCell className="font-medium">{estimate.title}</TableCell>
                                        <TableCell>{estimate.customerName}</TableCell>
                                        <TableCell>{format(new Date(estimate.createdAt), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getEstimateStatusStyles(estimate.status))}>{estimate.status}</Badge></TableCell>
                                        <TableCell>{formatCurrency(estimate.total)}</TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={getHref(`/dashboard/estimates/${estimate.id}`)}>View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="agreements" className="mt-4">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeader title="Title" field="title" sortConfig={agreementSortConfig} setSortConfig={setAgreementSortConfig} />
                                    <SortableHeader title="Customer" field="customerName" sortConfig={agreementSortConfig} setSortConfig={setAgreementSortConfig} />
                                    <SortableHeader title="Frequency" field="billingSchedule.frequency" sortConfig={agreementSortConfig} setSortConfig={setAgreementSortConfig} />
                                    <SortableHeader title="Next Due" field="billingSchedule.nextDueDate" sortConfig={agreementSortConfig} setSortConfig={setAgreementSortConfig} />
                                    <SortableHeader title="Status" field="status" sortConfig={agreementSortConfig} setSortConfig={setAgreementSortConfig} />
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAgreements.map(agreement => (
                                    <TableRow key={agreement.id}>
                                        <TableCell className="font-medium">{agreement.title}</TableCell>
                                        <TableCell>{agreement.customerName}</TableCell>
                                        <TableCell className="capitalize">{agreement.billingSchedule.frequency}</TableCell>
                                        <TableCell>{format(new Date(agreement.billingSchedule.nextDueDate), 'PP')}</TableCell>
                                        <TableCell><Badge className={cn(getServiceAgreementStatusStyles(agreement.status))}>{agreement.status}</Badge></TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href="#">View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
