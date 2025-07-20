
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus } from "lucide-react";

const noteTemplates = [
    "Called customer, no answer. Left voicemail.",
    "Customer requested a callback.",
    "Gate code is #1234.",
    "Beware of dog in backyard.",
    "Appointment confirmed for scheduled time.",
];

export function CustomerQuickNotes({ customerId }: { customerId: string }) {
    const { toast } = useToast();

    const handleAddNote = (note: string) => {
        // In a real app, this would be a server action to add the note to the customer's record
        console.log(`Adding note for customer ${customerId}: "${note}"`);
        toast({
            title: "Note Added",
            description: `A quick note has been added to the customer's file.`,
        });
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquarePlus className="h-5 w-5"/> Quick Notes</CardTitle>
        <CardDescription>Add a predefined note to the customer file.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {noteTemplates.map((note, index) => (
            <Button key={index} variant="secondary" className="justify-start text-left h-auto" onClick={() => handleAddNote(note)}>
                {note}
            </Button>
        ))}
      </CardContent>
    </Card>
  );
}
