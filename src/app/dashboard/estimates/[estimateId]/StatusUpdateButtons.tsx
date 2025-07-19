
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { updateEstimateStatus } from '@/app/actions';
import type { Estimate } from '@/lib/types';
import { Send, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatusButtonProps {
  newStatus: Estimate['status'];
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}

function StatusButton({ newStatus, children, variant }: StatusButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="newStatus" value={newStatus} disabled={pending} variant={variant}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}


export function StatusUpdateButtons({ estimate, onEstimateUpdate }: { estimate: Estimate, onEstimateUpdate: (estimate: Estimate) => void }) {
  const [state, formAction] = useActionState(updateEstimateStatus, { message: null });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.error ? "Error" : "Status Updated",
        description: state.message,
        variant: state.error ? "destructive" : "default",
      });
      if (state.data) {
        onEstimateUpdate(state.data);
      }
    }
  }, [state, toast, onEstimateUpdate]);

  const canBeSent = estimate.status === 'draft';
  const canBeAcceptedOrRejected = estimate.status === 'sent';
  const isFinal = estimate.status === 'accepted' || estimate.status === 'rejected';


  return (
    <form action={formAction} className="flex gap-2">
      <input type="hidden" name="estimateId" value={estimate.id} />

      {!isFinal && (
        <>
            {canBeSent && (
                <StatusButton newStatus="sent">
                    <Send className="mr-2 h-4 w-4" /> Send to Customer
                </StatusButton>
            )}

            {canBeAcceptedOrRejected && (
                <>
                    <StatusButton newStatus="accepted">
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </StatusButton>
                     <StatusButton newStatus="rejected" variant="destructive">
                        <X className="mr-2 h-4 w-4" /> Reject
                    </StatusButton>
                </>
            )}
        </>
      )}

    </form>
  );
}
