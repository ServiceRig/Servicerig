
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockData } from '@/lib/mock-data';
import type { PricebookItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const trades: PricebookItem['trade'][] = ['Plumbing', 'HVAC', 'Electrical', 'General'];

export function PricebookStandard() {
  const { toast } = useToast();
  const [items, setItems] = useState<PricebookItem[]>(mockData.pricebookItems);
  const [activeTab, setActiveTab] = useState<PricebookItem['trade'] | 'All'>('All');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<PricebookItem, 'id' | 'createdAt'>>({
      title: '',
      description: '',
      trade: 'General',
      price: 0,
      isCustom: true
  });

  const filteredItems = useMemo(() => {
    if (activeTab === 'All') {
      return items;
    }
    return items.filter(item => item.trade === activeTab);
  }, [items, activeTab]);
  
  const handleInputChange = (field: keyof typeof newItem, value: string | number | boolean) => {
      setNewItem(prev => ({ ...prev, [field]: value }));
  }

  const handleAddItem = () => {
    if (!newItem.title || newItem.price <= 0) {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please provide a valid title and price.',
        });
        return;
    }

    const newPricebookItem: PricebookItem = {
        ...newItem,
        id: `pb_custom_${Date.now()}`,
        createdAt: new Date(),
    };
    
    // Optimistically update the UI
    setItems(prevItems => [newPricebookItem, ...prevItems]);

    // In a real app, you would now call a server action to save to Firestore.
    console.log("Saving new item:", newPricebookItem);
    
    toast({
        title: 'Item Added',
        description: `"${newItem.title}" has been added to the price book.`,
    });

    // Reset form and close dialog
    setNewItem({ title: '', description: '', trade: 'General', price: 0, isCustom: true });
    setIsDialogOpen(false);
  }

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
                <DialogHeader>
                    <DialogTitle>Add Custom Item</DialogTitle>
                    <DialogDescription>
                        Create a new service or material for your price book.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={newItem.title} onChange={(e) => handleInputChange('title', e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" value={newItem.description} onChange={(e) => handleInputChange('description', e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input id="price" type="number" value={newItem.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trade" className="text-right">Trade</Label>
                        <Select value={newItem.trade} onValueChange={(value) => handleInputChange('trade', value as PricebookItem['trade'])}>
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
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAddItem}>Save Item</Button>
                </DialogFooter>
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
