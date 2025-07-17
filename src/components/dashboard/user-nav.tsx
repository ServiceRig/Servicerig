
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/use-role";
import { capitalize } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { LogOut } from "lucide-react";

function UserNavContent() {
    const { role } = useRole();
    const router = useRouter();

    const getInitials = (role: string) => {
        switch(role) {
            case 'admin': return 'AD';
            case 'dispatcher': return 'DI';
            case 'technician': return 'TC';
            default: return 'U';
        }
    }

    const handleSignOut = () => {
        router.push('/');
    }

    return (
       null
    )
}


export function UserNav() {
  return (
    <Suspense fallback={<div className="p-4">Loading user...</div>}>
      <UserNavContent />
    </Suspense>
  )
}
