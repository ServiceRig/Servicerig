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
        <SidebarFooter>
            <Button variant="ghost" className="h-auto w-full justify-start p-2 text-left group-data-[collapsible=icon]:justify-center" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
        </SidebarFooter>
    )
}


export function UserNav() {
  return (
    <Suspense fallback={<div className="p-4">Loading user...</div>}>
      <UserNavContent />
    </Suspense>
  )
}
