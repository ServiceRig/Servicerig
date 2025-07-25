

'use client';

import { useState, useCallback } from 'react';
import { AiPriceGenerator } from "@/components/dashboard/ai-price-generator";
import { PricebookStandard } from "@/components/dashboard/pricebook-standard";
import { Separator } from "@/components/ui/separator";
import { mockData } from '@/lib/mock-data';
import type { PricebookItem } from '@/lib/types';

export default function PriceBookPage() {
  const [items, setItems] = useState<PricebookItem[]>(mockData.pricebookItems as PricebookItem[]);

  const handleItemAdded = useCallback((newItem: PricebookItem) => {
    setItems(prevItems => [newItem, ...prevItems]);
  }, []);

  return (
    <div className="space-y-6">
        <AiPriceGenerator onItemAdded={handleItemAdded} />

        <Separator />

        <PricebookStandard items={items} onItemAdded={handleItemAdded} />
    </div>
    );
}

