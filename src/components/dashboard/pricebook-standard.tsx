

'use client';

import { useState, useMemo, useActionState, useEffect, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2, Save } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PricebookItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addPricebookItemAction } from '@/app/actions';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const trades: PricebookItem['trade'][] = ['Plumbing', 'HVAC', 'Electrical', 'General'];

function SaveButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {pending ? 'Saving...' : 'Save Item'}
        </Button>
    )
}

interface PricebookStandardProps {
    items: PricebookItem[];
    onItemAdded: (newItem: PricebookItem) => void;
}

export function PricebookStandard({ items, onItemAdded }: PricebookStandardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PricebookItem['trade'] | 'All'>('All');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveState, saveAction] = useActionState(addPricebookItemAction, { success: false, message: '', item: undefined });

  useEffect(() => {
    if (saveState.success && saveState.item) {
        toast({
            title: 'Item Added',
            description: `"${saveState.item.title}" has been added to the price book.`,
        });
        onItemAdded(saveState.item);
        setIsDialogOpen(false);
    } else if (saveState.message && !saveState.success) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: saveState.message,
        });
    }
  }, [saveState, onItemAdded, toast]);


  const filteredItems = useMemo(() => {
    if (activeTab === 'All') {
      return items;
    }
    return items.filter(item => item.trade === activeTab);
  }, [items, activeTab]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Standard Services Catalog</CardTitle>
            <CardDescription>Manage your predefined services and flat-rate pricing.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Custom Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={saveAction}>
                    <DialogHeader>
                        <DialogTitle>Add Custom Item</DialogTitle>
                        <DialogDescription>
                            Create a new service or material for your price book.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" name="title" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" name="description" className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" name="price" type="number" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="trade" className="text-right">Trade</Label>
                            <Select name="trade" defaultValue="General">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trades.map(trade => (
                                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
                        <SaveButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            {trades.map(trade => (
              <TabsTrigger key={trade} value={trade}>{trade}</TabsTrigger>
            ))}
          </TabsList>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Add to Estimate</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        No services found for this trade.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tabs>
      </CardContent>
    </Card>
  );
}
