
'use client';

import { MostUsedParts } from '@/components/dashboard/reports/inventory/MostUsedParts';
import { SuggestedReorders } from '@/components/dashboard/reports/inventory/SuggestedReorders';
import { VendorPriceTrends } from '@/components/dashboard/reports/inventory/VendorPriceTrends';

export default function InventoryReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Inventory Reports</h1>
                <p className="text-muted-foreground">
                    Analyze part usage, get reorder suggestions, and track vendor pricing.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MostUsedParts />
                <SuggestedReorders />
            </div>

            <div>
                <VendorPriceTrends />
            </div>
        </div>
    );
}
