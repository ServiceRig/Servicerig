
// In a real app, you would import the firestore instance.
// For now, we're using mock data.
import { mockData } from "@/lib/mock-data";
import type { PricebookItem } from "@/lib/types";


export async function addPricebookItem(itemData: Omit<PricebookItem, 'id' | 'createdAt'>) {
    console.log("Adding new pricebook item:", itemData);
    
    const newItem: PricebookItem = {
        ...itemData,
        id: `pb_item_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
    }
    
    // Add to the start of the array to see it immediately in the UI
    mockData.pricebookItems.unshift(newItem);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log("Successfully added pricebook item with ID:", newItem.id);
    return newItem.id;
}
