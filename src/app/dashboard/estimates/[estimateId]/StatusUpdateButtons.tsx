'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { updateEstimateStatus } from '@/app/actions';
import type { Estimate } from '@/lib/types';
import { Send, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface StatusButtonProps {
  newStatus: Estimate['status'];
  estimateId: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}

function StatusButton({ newStatus, estimateId, children, variant }: StatusButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="newStatus" value={newStatus} disabled={pending} variant={variant}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}


export function StatusUpdateButtons({ estimate }: { estimate: Estimate }) {
  const [state, formAction] = useActionState(updateEstimateStatus, { message: null });
  const [currentStatus, setCurrentStatus] = useState(estimate.status);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: "Status Updated",
        description: state.message,
      });
      // This is a bit of a workaround to update the UI immediately
      // In a real app with a proper state management or optimistic UI, this would be smoother
      const newStatus = state.message?.split(' ').pop()?.replace('.', '');
       if (newStatus && ['draft', 'sent', 'accepted', 'rejected'].includes(newStatus)) {
           setCurrentStatus(newStatus as Estimate['status']);
       }
    }
  }, [state, toast]);

  const canBeSent = currentStatus === 'draft';
  const canBeAcceptedOrRejected = currentStatus === 'sent';
  const isFinal = currentStatus === 'accepted' || currentStatus === 'rejected';


  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="estimateId" value={estimate.id} />

      {!isFinal && (
        <>
            {canBeSent && (
                <StatusButton newStatus="sent" estimateId={estimate.id}>
                    <Send className="mr-2 h-4 w-4" /> Send to Customer
                </StatusButton>
            )}

            {canBeAcceptedOrRejected && (
                <>
                    <StatusButton newStatus="accepted" estimateId={estimate.id}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </StatusButton>
                     <StatusButton newStatus="rejected" estimateId={estimate.id} variant="destructive">
                        <X className="mr-2 h-4 w-4" /> Reject
                    </StatusButton>
                </>
            )}
        </>
      )}

    </form>
  );
}