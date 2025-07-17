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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto w-full justify-start p-2 text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/32x32.png`} alt="User" data-ai-hint="person avatar" />
                            <AvatarFallback>{role ? getInitials(role) : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2 group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold text-sm">Demo User</p>
                            <p className="text-xs text-muted-foreground">{role ? capitalize(role) : 'User'}</p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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
