
'use client';
import { useActionState, useState, useTransition } from 'react';
import { runGenerateTieredEstimates } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader, Presentation } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

function GenerateButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="button" disabled={isPending} className="w-full">
      {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      {isPending ? 'Generating...' : 'Generate Tiers'}
    </Button>
  );
}

export type TierData = {
    title: string;
    description: string;
    price?: number;
}

interface AITierGeneratorProps {
    onTiersFinalized: (tiers: TierData[]) => void;
}

export function AITierGenerator({ onTiersFinalized }: AITierGeneratorProps) {
  const initialState = { message: null, errors: null, data: null };
  const [state, dispatch] = useActionState(runGenerateTieredEstimates, initialState);
  const { toast } = useToast();
  
  const [isPending, startTransition] = useTransition();
  const [jobDetails, setJobDetails] = useState('');

  const [editableTiers, setEditableTiers] = useState<TierData[] | null>(null);

  useEffect(() => {
    if (state.message) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.message,
        });
    }
    if (state.data) {
        toast({
            title: "Success",
            description: "AI Tiers generated successfully. You can now edit them.",
        });
        setEditableTiers([
            { title: 'Good', description: state.data.good.description, price: state.data.good.price },
            { title: 'Better', description: state.data.better.description, price: state.data.better.price },
            { title: 'Best', description: state.data.best.description, price: state.data.best.price },
        ]);
    }
  }, [state, toast]);

  const handleTierChange = (index: number, field: 'description' | 'price', value: string | number) => {
      if (!editableTiers) return;
      const newTiers = [...editableTiers];
      if (field === 'price') {
          newTiers[index][field] = parseFloat(value as string) || 0;
      } else {
          newTiers[index][field] = value as string;
      }
      setEditableTiers(newTiers);
  }

  const handleDisplayToCustomer = () => {
    if (editableTiers) {
        onTiersFinalized(editableTiers);
    }
  }

  const handleGenerateClick = () => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('jobDetails', jobDetails);
      formData.append('customerHistory', 'No history provided.');
      dispatch(formData);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Tier Generation</CardTitle>
        <CardDescription>Describe the job to generate Good/Better/Best pricing tiers automatically.</CardDescription>
      </CardHeader>
      <div>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="jobDetails">Job Description</Label>
                <Textarea
                id="jobDetails"
                name="jobDetails"
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                placeholder="e.g., Customer reports HVAC unit is not cooling. Unit is a 10-year-old 3-ton system. Suspect a coolant leak or compressor failure..."
                rows={6}
                />
                {state?.errors?.jobDetails && <p className="text-sm font-medium text-destructive">{state.errors.jobDetails[0]}</p>}
            </div>
             <Button type="button" onClick={handleGenerateClick} disabled={isPending} className="w-full">
                {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isPending ? 'Generating...' : 'Generate Tiers'}
             </Button>
        </CardContent>
      </div>
      {editableTiers && (
        <>
            <CardContent className="space-y-4 border-t pt-4 mt-4">
                 {editableTiers.map((tier, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                        <Label className="font-semibold text-lg">{tier.title}</Label>
                        <Textarea 
                            value={tier.description}
                            onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                            rows={4}
                            className="text-sm"
                        />
                        <div className="grid gap-2">
                             <Label htmlFor={`price-${index}`} className="text-sm">Price</Label>
                             <Input 
                                id={`price-${index}`}
                                type="number"
                                value={tier.price}
                                onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                                placeholder="Enter price"
                             />
                        </div>
                    </div>
                 ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleDisplayToCustomer} className="w-full bg-accent hover:bg-accent/90">
                    <Presentation className="mr-2 h-4 w-4" />
                    Display To Customer
                </Button>
            </CardFooter>
        </>
        )}
    </Card>
  );
}
