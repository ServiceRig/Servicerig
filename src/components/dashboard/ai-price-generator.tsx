

'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Wand2, Loader2, History, PlusCircle, Save } from 'lucide-react';
import { generatePrice, GeneratePriceOutput } from '@/ai/flows/generate-price';
import { addPricebookItemAction } from '@/app/actions';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { LineItem, PricebookItem } from '@/lib/types';
import { useRole } from '@/hooks/use-role';


type ActionState = {
  data?: GeneratePriceOutput | null;
  error?: string | null;
}

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {pending ? 'Generating...' : 'Generate Price'}
        </Button>
    )
}

function SaveItemButton() {
    const { pending } = useFormStatus();
     return (
        <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save as Item'}
        </Button>
    )
}


async function generatePriceAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const jobDescription = formData.get('jobDescription') as string;
    if (!jobDescription || jobDescription.length < 10) {
        return { error: 'Please provide a more detailed job description (at least 10 characters).' };
    }
    
    try {
        const result = await generatePrice({ jobDescription });
        return { data: result };
    } catch (e) {
        console.error(e);
        return { error: 'An unexpected error occurred while generating the price.' };
    }
}

interface AiPriceGeneratorProps {
    onItemAdded: (newItem: PricebookItem) => void;
}

export function AiPriceGenerator({ onItemAdded }: AiPriceGeneratorProps) {
    const router = useRouter();
    const { role } = useRole();
    const { toast } = useToast();
    const [generateState, generateAction] = useActionState(generatePriceAction, { data: null, error: null });
    const [saveState, saveAction] = useActionState(addPricebookItemAction, { success: false, message: '', item: undefined });
    
    const [editableResult, setEditableResult] = useState<GeneratePriceOutput | null>(null);

    useEffect(() => {
        if (generateState.data) {
            setEditableResult(generateState.data);
        }
    }, [generateState.data]);

    useEffect(() => {
        if (saveState.success && saveState.item) {
            toast({
                title: 'Success',
                description: saveState.message,
            });
            onItemAdded(saveState.item);
        } else if (saveState.message && !saveState.success) {
            toast({
                title: 'Error',
                description: saveState.message,
                variant: 'destructive',
            })
        }
    }, [saveState, toast, onItemAdded]);

    const handleFieldChange = (field: keyof GeneratePriceOutput, value: string | number | string[]) => {
        if (editableResult) {
            setEditableResult({ ...editableResult, [field]: value });
        }
    };
    
    const handleMaterialChange = (index: number, value: string) => {
        if (editableResult) {
            const newMaterials = [...editableResult.materials];
            newMaterials[index] = value;
            handleFieldChange('materials', newMaterials);
        }
    }
    
    const addMaterial = () => {
        if(editableResult) {
            handleFieldChange('materials', [...editableResult.materials, '']);
        }
    }

    const handleAddToEstimate = () => {
        if (!editableResult) return;
        
        const lineItem: LineItem = {
            description: editableResult.serviceDescription,
            quantity: 1,
            unitPrice: editableResult.suggestedPrice,
            inventoryParts: [],
        }
        
        const params: Record<string, string> = {
            title: editableResult.recommendedTitle,
            lineItems: JSON.stringify([lineItem])
        }

        if (role) {
            params.role = role;
        }
        
        const query = new URLSearchParams(params).toString();

        router.push(`/dashboard/estimates/new?${query}`);
    }

  return (
    <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle>AI Price Generator</CardTitle>
                <CardDescription>Describe a complex job to get a title, description, price, and materials list.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                History
            </Button>
        </CardHeader>
        <form action={generateAction}>
            <CardContent>
                <div className="grid gap-2">
                    <Label htmlFor="jobDescription" className="sr-only">Job Description</Label>
                    <Textarea
                        id="jobDescription"
                        name="jobDescription"
                        placeholder="e.g., Replace a 40 gallon gas water heater located in a tight attic space. Include haul away of old unit."
                        rows={3}
                        className="text-base"
                    />
                     {generateState.error && <p className="text-sm font-medium text-destructive">{generateState.error}</p>}
                </div>
            </CardContent>
            <CardFooter>
                 <GenerateButton />
            </CardFooter>
        </form>

        {editableResult && (
            <CardContent className="border-t pt-6 space-y-4">
                <Alert>
                    <AlertTitle>AI Generated Result</AlertTitle>
                    <AlertDescription>Review and edit the generated details below before saving or adding to an estimate.</AlertDescription>
                </Alert>
                
                <form action={saveAction} className="space-y-4">
                     <input type="hidden" name="title" value={editableResult.recommendedTitle} />
                     <input type="hidden" name="description" value={editableResult.serviceDescription} />
                     <input type="hidden" name="price" value={String(editableResult.suggestedPrice)} />
                     <input type="hidden" name="trade" value="General" />

                     <div className="grid gap-2">
                        <Label htmlFor="recommendedTitle">Recommended Title</Label>
                        <Input id="recommendedTitle" value={editableResult.recommendedTitle} onChange={e => handleFieldChange('recommendedTitle', e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="serviceDescription">Service Description</Label>
                        <Textarea id="serviceDescription" value={editableResult.serviceDescription} onChange={e => handleFieldChange('serviceDescription', e.target.value)} rows={4}/>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="suggestedPrice">Suggested Price</Label>
                            <Input id="suggestedPrice" type="number" value={editableResult.suggestedPrice} onChange={e => handleFieldChange('suggestedPrice', parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                     <div className="grid gap-2">
                        <Label>Material List</Label>
                        <div className="space-y-2">
                        {editableResult.materials.map((material, index) => (
                            <Input key={index} value={material} onChange={(e) => handleMaterialChange(index, e.target.value)} />
                        ))}
                        </div>
                        <Button type="button" variant="link" size="sm" className="justify-start" onClick={addMaterial}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Material
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Button type="button" onClick={handleAddToEstimate}><PlusCircle className="mr-2 h-4 w-4" /> Add to Estimate</Button>
                        <SaveItemButton />
                    </div>
                </form>
            </CardContent>
        )}
    </Card>
  );
}
