
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HardHat } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Technician = {
    id: string;
    name: string;
    avatarUrl?: string;
}

export function CustomerRecentTechnicians({ technicians }: { technicians: Technician[] }) {
    if (technicians.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><HardHat className="h-5 w-5" /> Recent Technicians</CardTitle>
        <CardDescription>The last {technicians.length} techs who serviced this customer.</CardDescription>
      </CardHeader>
      <CardContent>
         <TooltipProvider>
            <div className="flex -space-x-2">
            {technicians.map(tech => (
                 <Tooltip key={tech.id}>
                    <TooltipTrigger asChild>
                         <Avatar className="border-2 border-card">
                            <AvatarImage src={tech.avatarUrl} alt={tech.name} />
                            <AvatarFallback>{tech.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tech.name}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
