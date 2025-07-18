
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

    const handleSelectTier = (tier: TierData) => {
        setSelectedTier(tier);
    }

    const handleAccept = () => {
        if (selectedTier) {
            onAccept(selectedTier);
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedTier(null); // Reset selection on close
        }
        onOpenChange(open);
    }

    const tierColors = {
        Good: { border: 'border-gray-300', text: 'text-gray-900', ring: 'ring-gray-500' },
        Better: { border: 'border-primary', text: 'text-primary', ring: 'ring-primary' },
        Best: { border: 'border-amber-500', text: 'text-amber-500', ring: 'ring-amber-500' },
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-8">
                <DialogHeader>
                    <DialogTitle className="text-center text-4xl font-bold">Please Choose an Option</DialogTitle>
                    <DialogDescription className="text-center text-lg">Review the options below and make a selection.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                   {tiers.map((tier) => {
                       const colors = tierColors[tier.title as keyof typeof tierColors] || tierColors.Good;
                       const isSelected = selectedTier?.title === tier.title;

                       return (
                           <Card key={tier.title} className={cn(
                                "flex flex-col transition-all duration-300", 
                                colors.border, 
                                isSelected ? `ring-4 ${colors.ring} shadow-2xl` : 'shadow-md'
                            )}>
                               <CardHeader className="text-center">
                                   <CardTitle className={cn("text-3xl font-bold", colors.text)}>{tier.title}</CardTitle>
                               </CardHeader>
                               <CardContent className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
                                   <p className="text-5xl font-bold">{formatCurrency(tier.price)}</p>
                                   <p className="text-muted-foreground flex-grow">{tier.description}</p>
                               </CardContent>
                               <CardFooter>
                                    <Button 
                                        className="w-full text-lg py-6" 
                                        onClick={() => handleSelectTier(tier)}
                                        variant={isSelected ? 'default' : 'outline'}
                                    >
                                        {isSelected && <Check className="mr-2 h-5 w-5" />}
                                        Select {tier.title}
                                    </Button>
                               </CardFooter>
                           </Card>
                       )
                   })}
                </div>

                {selectedTier && (
                     <DialogFooter className="border-t pt-6 mt-4 flex-col sm:flex-col sm:justify-center items-center gap-4">
                        <div className="w-full max-w-md">
                            <Label htmlFor="signature" className="text-lg font-semibold">Customer Signature</Label>
                            <div id="signature" className="w-full h-32 mt-2 bg-muted rounded-md flex items-center justify-center border-2 border-dashed">
                                <p className="text-muted-foreground">Signature Pad Placeholder</p>
                            </div>
                        </div>
                        <Button size="lg" onClick={handleAccept} className="w-full max-w-md bg-accent hover:bg-accent/90 text-xl py-7">
                           <Signature className="mr-2 h-6 w-6"/> Accept Estimate for {formatCurrency(selectedTier.price)}
                        </Button>
                     </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
