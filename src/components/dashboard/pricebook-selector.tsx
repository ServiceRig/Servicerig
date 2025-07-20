
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { mockData } from '@/lib/mock-data';
import type { PricebookItem } from '@/lib/types';

interface PricebookSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onItemSelected: (item: PricebookItem) => void;
}

export function PricebookSelector({ open, onOpenChange, onItemSelected }: PricebookSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const items = mockData.pricebookItems as PricebookItem[];

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lowercasedTerm = searchTerm.toLowerCase();
        return items.filter(item => 
            item.title.toLowerCase().includes(lowercasedTerm) || 
            item.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [items, searchTerm]);

    const handleSelect = (item: PricebookItem) => {
        onItemSelected(item);
        onOpenChange(false);
        setSearchTerm('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <Command shouldFilter={false}>
                     <DialogHeader className="p-4 pb-0">
                        <DialogTitle>Select from Price Book</DialogTitle>
                        <DialogDescription>
                            Search for a service or material to add to the estimate.
                        </DialogDescription>
                    </DialogHeader>
                    <CommandInput 
                        value={searchTerm} 
                        onValueChange={setSearchTerm} 
                        placeholder="Search services and materials..." 
                        className="mx-4 mb-2 w-auto"
                    />
                    <CommandList className="max-h-[50vh]">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {filteredItems.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    onSelect={() => handleSelect(item)}
                                >
                                    <span>{item.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
