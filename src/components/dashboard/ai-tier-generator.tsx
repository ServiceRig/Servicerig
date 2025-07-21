
'use client';
import { useActionState, useState, useTransition } from 'react';
import { runGenerateTieredEstimates } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type TierData = {
    title: string;
    description: string;
    price?: number;
}

interface AITierGeneratorProps {
    onTiersChange: (tiers: TierData[]) => void;
}

export function AITierGenerator({ onTiersChange }: AITierGeneratorProps) {
  const initialState = { message: null, errors: null, data: null };
  const [state, dispatch] = useActionState(runGenerateTieredEstimates, initialState);
  const { toast } = useToast();
  
  const [isPending, startTransition] = useTransition();
  const [jobDetails, setJobDetails] = useState('');

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
        onTiersChange([
            { title: 'Good', description: state.data.good.description, price: state.data.good.price },
            { title: 'Better', description: state.data.better.description, price: state.data.better.price },
            { title: 'Best', description: state.data.best.description, price: state.data.best.price },
        ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);


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
    </Card>
  );
}
