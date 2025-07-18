'use client';
import { useActionState, useFormStatus } from 'react';
import { runGenerateTieredEstimates } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Estimate } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      {pending ? 'Generating...' : 'Generate Tiers'}
    </Button>
  );
}

interface AITierGeneratorProps {
    onTiersGenerated: (tiers: Estimate['gbbTier']) => void;
}

export function AITierGenerator({ onTiersGenerated }: AITierGeneratorProps) {
  const initialState = { message: null, errors: null, data: null };
  const [state, dispatch] = useActionState(runGenerateTieredEstimates, initialState);
  const { toast } = useToast();

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
            description: "AI Tiers generated successfully.",
        });
        onTiersGenerated({
            good: state.data.goodEstimate,
            better: state.data.betterEstimate,
            best: state.data.bestEstimate,
        });
    }
  }, [state, toast, onTiersGenerated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Tier Generation</CardTitle>
        <CardDescription>Describe the job to generate Good/Better/Best pricing tiers automatically.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="jobDetails">Job Description</Label>
                <Textarea
                id="jobDetails"
                name="jobDetails"
                placeholder="e.g., Customer reports HVAC unit is not cooling. Unit is a 10-year-old 3-ton system. Suspect a coolant leak or compressor failure..."
                rows={6}
                />
                {state?.errors?.jobDetails && <p className="text-sm font-medium text-destructive">{state.errors.jobDetails[0]}</p>}
            </div>
            {state?.data && (
                <div className="space-y-4">
                     <Alert className="border-green-500 text-green-700">
                        <CheckCircle2 className="h-4 w-4 !text-green-500" />
                        <AlertTitle>Tiers Generated</AlertTitle>
                        <AlertDescription>Review the tiers below. They will be saved with the estimate.</AlertDescription>
                    </Alert>
                    <div>
                        <Label className="font-semibold">Good Tier</Label>
                        <p className="text-sm p-2 bg-muted rounded-md">{state.data.goodEstimate}</p>
                    </div>
                     <div>
                        <Label className="font-semibold">Better Tier</Label>
                        <p className="text-sm p-2 bg-muted rounded-md">{state.data.betterEstimate}</p>
                    </div>
                     <div>
                        <Label className="font-semibold">Best Tier</Label>
                        <p className="text-sm p-2 bg-muted rounded-md">{state.data.bestEstimate}</p>
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
