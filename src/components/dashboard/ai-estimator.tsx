
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { getTieredEstimates } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? 'Generating...' : 'Generate Estimates'}
      <Wand2 className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function AiEstimator() {
  const initialState = { message: null, errors: null, data: null };
  const [state, dispatch] = useFormState(getTieredEstimates, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Estimates</CardTitle>
        <CardDescription>Generate Good/Better/Best estimates using AI based on job details and customer history.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form action={dispatch} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="jobDetails">Job Details</Label>
            <Textarea
              id="jobDetails"
              name="jobDetails"
              placeholder="e.g., HVAC unit not cooling, requires diagnostics and potential part replacement..."
              rows={4}
            />
             {state.errors?.jobDetails && <p className="text-sm font-medium text-destructive">{state.errors.jobDetails[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customerHistory">Customer History</Label>
            <Textarea
              id="customerHistory"
              name="customerHistory"
              placeholder="e.g., Long-term customer, always pays on time, has a service agreement..."
              rows={4}
            />
            {state.errors?.customerHistory && <p className="text-sm font-medium text-destructive">{state.errors.customerHistory[0]}</p>}
          </div>
          <SubmitButton />
        </form>
        {state.data && (
            <div className="mt-6">
                <Alert className="mb-4 border-green-500 text-green-700">
                    <CheckCircle2 className="h-4 w-4 !text-green-500" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        Estimates generated. Review the options below.
                    </AlertDescription>
                </Alert>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="font-bold">Good Estimate</AccordionTrigger>
                        <AccordionContent>{state.data.good.description}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="font-bold">Better Estimate</AccordionTrigger>
                        <AccordionContent>{state.data.better.description}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="font-bold">Best Estimate</AccordionTrigger>
                        <AccordionContent>{state.data.best.description}</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
