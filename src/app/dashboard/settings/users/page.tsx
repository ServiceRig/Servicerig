

'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { mockData } from '@/lib/mock-data';
import type { User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const getRoleStyles = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'bg-purple-500 text-white';
    case 'dispatcher': return 'bg-blue-500 text-white';
    case 'technician': return 'bg-orange-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusStyles = (active: boolean) => {
  return active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white';
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>(mockData.users);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchTerm ?
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
                : true;
            
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage your team members and their account permissions.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                     <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                                <SelectItem value="technician">Technician</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize", getRoleStyles(user.role))}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize", getStatusStyles(user.active))}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Deactivate User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
