
'use client';
import { Suspense } from "react";

function UserNavContent() {
    return null
}


export function UserNav() {
  return (
    <Suspense fallback={<div className="p-4">Loading user...</div>}>
      <UserNavContent />
    </Suspense>
  )
}
