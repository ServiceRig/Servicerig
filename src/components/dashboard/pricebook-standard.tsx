
'use client';

import { useState, useMemo, useActionState, useEffect, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2, Save, Trash2 } from 'lucide-react';
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

function AddOrEditItemDialog({ isOpen, onOpenChange, onItemAdded }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onItemAdded: (item: PricebookItem) => void }) {
    const { toast } = useToast();
    const [saveState, saveAction] = useActionState(addPricebookItemAction, { success: false, message: '', item: undefined });
    const [materials, setMaterials] = useState<{name: string, quantity: number}[]>([]);

    useEffect(() => {
        if (!isOpen) {
             // Reset form when dialog closes
            setMaterials([]);
            // You might want to reset the saveState as well if it holds errors
            return;
        }

        if (saveState.success && saveState.item) {
            toast({
                title: 'Item Added',
                description: `"${saveState.item.title}" has been added to the price book.`,
            });
            onItemAdded(saveState.item);
            onOpenChange(false);
        } else if (saveState.message && !saveState.success) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: saveState.message,
            });
        }
    }, [saveState, onItemAdded, toast, isOpen, onOpenChange]);

    const handleAddMaterial = () => setMaterials(prev => [...prev, { name: '', quantity: 1 }]);
    const handleRemoveMaterial = (index: number) => setMaterials(prev => prev.filter((_, i) => i !== index));
    const handleMaterialChange = (index: number, field: 'name' | 'quantity', value: string | number) => {
        const newMaterials = [...materials];
        if (field === 'quantity') {
             newMaterials[index][field] = Number(value) || 0;
        } else {
             newMaterials[index][field] = value as string;
        }
        setMaterials(newMaterials);
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Custom Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form action={saveAction}>
                    <input type="hidden" name="materials" value={JSON.stringify(materials)} />
                    <DialogHeader>
                        <DialogTitle>Add Custom Item</DialogTitle>
                        <DialogDescription>
                            Create a new service or material for your price book.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" name="price" type="number" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Service Description</Label>
                            <Textarea id="description" name="description" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="trade">Trade</Label>
                            <Select name="trade" defaultValue="General">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trades.map(trade => (
                                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Materials</Label>
                             <div className="border rounded-md p-2 space-y-2">
                                {materials.map((mat, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input placeholder="Material name" value={mat.name} onChange={e => handleMaterialChange(index, 'name', e.target.value)} />
                                        <Input type="number" className="w-24" placeholder="Qty" value={mat.quantity} onChange={e => handleMaterialChange(index, 'quantity', e.target.value)} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMaterial(index)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={handleAddMaterial}><PlusCircle className="mr-2 h-4 w-4" />Add Material</Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost" type="button">Cancel</Button></DialogClose>
                        <SaveButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


interface PricebookStandardProps {
    items: PricebookItem[];
    onItemAdded: (newItem: PricebookItem) => void;
}

export function PricebookStandard({ items, onItemAdded }: PricebookStandardProps) {
  const [activeTab, setActiveTab] = useState<PricebookItem['trade'] | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
        <AddOrEditItemDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onItemAdded={onItemAdded} />
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
                 <TableHead>Materials</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate">{item.description}</TableCell>
                  <TableCell>{item.materials?.length || 0}</TableCell>
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
                    <TableCell colSpan={5} className="text-center h-24">
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
