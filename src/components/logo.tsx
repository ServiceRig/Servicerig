// src/components/logo.tsx

'use client';

import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="/logo-app.png"
      alt="ServiceRig Logo"
      width={80}
      height={80}
      priority
      {...props}
    />
  );
}
