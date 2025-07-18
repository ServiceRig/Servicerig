
'use client';

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { StatusUpdateButtons } from "./StatusUpdateButtons";
import { convertEstimateToInvoice } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { Estimate } from "@/lib/types";

export function EstimateActions({ estimate }: { estimate: Estimate }) {
    const convertAction = convertEstimateToInvoice.bind(null, estimate.id);
    
    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="outline">Edit Estimate</Button>
            <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print / PDF
            </Button>
            <StatusUpdateButtons estimate={estimate} />
             {estimate.status === 'accepted' && (
                <form action={convertAction}>
                    <SubmitButton
                        label="Convert to Invoice"
                        loadingLabel="Converting..."
                        disabled={estimate.status !== 'accepted'}
                    />
                </form>
             )}
        </div>
    )
}
