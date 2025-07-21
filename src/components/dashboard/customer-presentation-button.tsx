
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Presentation } from 'lucide-react';
import { CustomerPresentationView } from '@/components/dashboard/customer-presentation-view';
import type { TierData } from './ai-tier-generator';
import { useToast } from '@/hooks/use-toast';

interface CustomerPresentationButtonProps {
    tiers: TierData[] | null;
    baseEstimateData: {
      customerId: string;
      jobId?: string;
      title: string;
    }
}

export function CustomerPresentationButton({ tiers, baseEstimateData }: CustomerPresentationButtonProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleDisplayClick = () => {
        if (!baseEstimateData.customerId) {
            toast({
                variant: "destructive",
                title: "Customer not selected",
                description: "Please select a customer before presenting options.",
            });
            return;
        }
        if (!tiers || tiers.length === 0) {
            toast({
                variant: "destructive",
                title: "No Tiers Available",
                description: "Please generate or load tiers before presenting.",
            });
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            <Button onClick={handleDisplayClick} className="w-full bg-accent hover:bg-accent/90">
                <Presentation className="mr-2 h-4 w-4" />
                Display To Customer
            </Button>
            {tiers && (
                 <CustomerPresentationView 
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    tiers={tiers}
                    baseEstimateData={baseEstimateData}
                />
            )}
        </>
    );
}
