
'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kpi } from "@/lib/kpi-data";
import { Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";

interface CustomizeKpiSheetProps {
    allKpis: Kpi[];
    visibleKpis: Set<string>;
    onKpiToggle: (kpiId: string, checked: boolean) => void;
}


export function CustomizeKpiSheet({ allKpis, visibleKpis, onKpiToggle }: CustomizeKpiSheetProps) {

    const kpiCategories = useMemo(() => {
        const categories = allKpis.reduce((acc, kpi) => {
            if (!acc.find(c => c.id === kpi.category)) {
                acc.push({ id: kpi.category, name: `${kpi.category} KPIs` });
            }
            return acc;
        }, [] as {id: string, name: string}[]);
        return categories;
    }, [allKpis]);


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Customize
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                 <SheetHeader>
                    <SheetTitle>Customize KPIs</SheetTitle>
                    <SheetDescription>
                        Select the KPIs you want to display on your report.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-80px)] mt-4 pr-6">
                    <div className="space-y-6">
                        {kpiCategories.map(category => (
                            <div key={category.id}>
                                <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
                                <div className="space-y-4">
                                {allKpis.filter(kpi => kpi.category === category.id).map(kpi => (
                                    <div key={kpi.id} className="flex items-start gap-4 p-3 rounded-lg border">
                                        <Checkbox
                                            id={kpi.id}
                                            checked={visibleKpis.has(kpi.id)}
                                            onCheckedChange={(checked) => onKpiToggle(kpi.id, !!checked)}
                                            className="mt-1"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor={kpi.id} className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {kpi.title}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{kpi.description}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
