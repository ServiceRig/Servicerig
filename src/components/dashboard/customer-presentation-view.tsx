
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Signature } from 'lucide-react';
import type { TierData } from './ai-tier-generator';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

interface CustomerPresentationViewProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tiers: TierData[];
    onAccept: (selectedTier: TierData) => void;
}

export function CustomerPresentationView({ isOpen, onOpenChange, tiers, onAccept }: CustomerPresentationViewProps) {
    const [selectedTier, setSelectedTier] = useState<TierData | null>(null);
    const [signature, setSignature] = useState('');

    const handleSelectTier = (tier: TierData) => {
        setSelectedTier(tier);
    }

    const handleAccept = () => {
        if (selectedTier) {
            onAccept(selectedTier);
        }
    }

    const tierColors = [
        'border-gray-300',
        'border-primary',
        'border-amber-500'
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Please Choose an Option</DialogTitle>
                    <DialogDescription>Review the options below and make a selection.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                   {tiers.map((tier, index) => (
                       <Card key={index} className={cn("flex flex-col", tierColors[index], selectedTier?.title === tier.title && 'ring-2 ring-primary shadow-lg')}>
                           <CardHeader>
                               <CardTitle className={cn("text-2xl", index === 1 && 'text-primary', index === 2 && 'text-amber-500')}>{tier.title}</CardTitle>
                           </CardHeader>
                           <CardContent className="flex-grow space-y-4">
                               <p className="text-4xl font-bold">{formatCurrency(tier.price)}</p>
                               <p className="text-muted-foreground">{tier.description}</p>
                           </CardContent>
                           <CardFooter>
                                <Button 
                                    className="w-full" 
                                    onClick={() => handleSelectTier(tier)}
                                    variant={selectedTier?.title === tier.title ? 'default' : 'outline'}
                                >
                                    {selectedTier?.title === tier.title && <Check className="mr-2 h-4 w-4" />}
                                    Select {tier.title}
                                </Button>
                           </CardFooter>
                       </Card>
                   ))}
                </div>

                {selectedTier && (
                     <DialogFooter className="border-t pt-4 flex-col sm:flex-col sm:justify-center items-center gap-4">
                        <div className="w-full max-w-md">
                            <Label>Customer Signature</Label>
                            <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center border-2 border-dashed">
                                <p className="text-muted-foreground">Signature Pad Placeholder</p>
                            </div>
                        </div>
                        <Button size="lg" onClick={handleAccept} className="w-full max-w-md bg-accent hover:bg-accent/90">
                           <Signature className="mr-2 h-5 w-5"/> Accept Estimate for {formatCurrency(selectedTier.price)}
                        </Button>
                     </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
