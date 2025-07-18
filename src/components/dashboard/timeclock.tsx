
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square } from 'lucide-react';
import { Badge } from '../ui/badge';

export function Timeclock() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const toggleClock = () => {
    setIsClockedIn(!isClockedIn);
  };

  const grossPay = 750.00;
  const netPayLower = grossPay * 0.75;
  const netPayUpper = grossPay * 0.82;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Timeclock</CardTitle>
                <CardDescription>Clock in and out for your shift.</CardDescription>
            </div>
            <Badge variant={isClockedIn ? 'default' : 'secondary'} className={`transition-colors ${isClockedIn ? 'bg-green-500' : 'bg-gray-500'}`}>
                {isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-5xl font-bold font-mono text-primary">
            {time.toLocaleTimeString()}
        </div>
        <div>
            <p className="text-muted-foreground">This week&apos;s pay:</p>
            <p className="text-2xl font-semibold">${grossPay.toFixed(2)} <span className="text-sm text-muted-foreground">Gross</span></p>
            <p className="text-lg text-muted-foreground">${netPayLower.toFixed(2)} - ${netPayUpper.toFixed(2)} <span className="text-sm">Est. Net</span></p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={toggleClock} className="w-full" variant={isClockedIn ? 'destructive' : 'default'}>
          {isClockedIn ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isClockedIn ? 'Clock Out' : 'Clock In'}
        </Button>
      </CardFooter>
    </Card>
  );
}
