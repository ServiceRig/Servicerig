import { cn } from "@/lib/utils";
import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-8 h-8", props.className)}
      {...props}
    >
        <title>ServiceRig Logo</title>
        <path d="M12 22v-6" />
        <path d="M15.24 12.81a6 6 0 0 0-8.48 0" />
        <path d="M18.36 9.68a10 10 0 0 0-12.72 0" />
        <path d="M21.49 6.55a14 14 0 0 0-18.98 0" />
        <path d="M5.52 16.89A6 6 0 0 1 12 13a6 6 0 0 1 6.48 3.89" />
        <path d="M12 13V2" />
        <path d="M8 2h8" />
    </svg>
  );
}
