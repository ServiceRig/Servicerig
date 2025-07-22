
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return {
        value: i,
        label: `${hour}:00`,
    };
});

export default function SchedulingSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(mockData.scheduleSettings);

    const handleSave = () => {
        if (settings.endHour <= settings.startHour) {
            toast({
                variant: 'destructive',
                title: 'Invalid Time Range',
                description: 'The end hour must be after the start hour.',
            });
            return;
        }
        
        // In a real app, this would be a server action to update settings in Firestore
        mockData.scheduleSettings = settings;
        
        toast({
            title: 'Settings Saved',
            description: 'Your scheduling settings have been updated.',
        });
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Scheduling Settings</h1>
                <p className="text-muted-foreground">Customize the appearance and behavior of the scheduling calendars.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workday Hours</CardTitle>
                    <CardDescription>Define the visible hours on the daily and weekly schedule views.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="start-hour">Start of Day</Label>
                            <Select
                                value={String(settings.startHour)}
                                onValueChange={(value) => setSettings(s => ({ ...s, startHour: parseInt(value) }))}
                            >
                                <SelectTrigger id="start-hour"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map(opt => (
                                        <SelectItem key={`start-${opt.value}`} value={String(opt.value)}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="end-hour">End of Day</Label>
                             <Select
                                value={String(settings.endHour)}
                                onValueChange={(value) => setSettings(s => ({ ...s, endHour: parseInt(value) }))}
                            >
                                <SelectTrigger id="end-hour"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map(opt => (
                                        <SelectItem key={`end-${opt.value}`} value={String(opt.value)}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    );
}
