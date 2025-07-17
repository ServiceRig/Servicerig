// src/components/logo.tsx

'use client';

import Image from 'next/image';

export function Logo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={props.className}>
      <Image
        src="/logo-app.png"
        alt="ServiceRig Logo"
        width={160}
        height={40}
        priority
      />
    </div>
  );
}
