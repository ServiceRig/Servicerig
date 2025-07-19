'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SubmitButtonProps {
    label: string;
    loadingLabel: string;
    disabled?: boolean;
    icon?: LucideIcon;
}

export function SubmitButton({ label, loadingLabel, disabled = false, icon: Icon }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {label}
        </>
      )}
    </Button>
  );
}
