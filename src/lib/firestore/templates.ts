
// In a real app, you would import the firestore instance:
// import { db } from './firebase'; 
// import { collection, getDocs, addDoc } from 'firebase/firestore';

import { mockData } from "@/lib/mock-data";
import { EstimateTemplate, GbbTier, LineItem } from "@/lib/types";

// This is a mock implementation. In a real app, you'd use Firebase.
const templates: EstimateTemplate[] = mockData.estimateTemplates;

/**
 * Fetches all estimate templates.
 * In a real app, this would use getDocs.
 * @returns An array of EstimateTemplate objects.
 */
export async function getEstimateTemplates(): Promise<EstimateTemplate[]> {
  console.log("Fetching all estimate templates...");
  // Simulate firestore getDocs
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return templates;
}

/**
 * Fetches a single estimate template by its ID.
 * @param id The template's ID.
 * @returns An EstimateTemplate object or null if not found.
 */
export async function getEstimateTemplateById(id: string): Promise<EstimateTemplate | null> {
    console.log(`Fetching estimate template with id: ${id}`);
    const template = templates.find(t => t.id === id) || null;
    await new Promise(resolve => setTimeout(resolve, 50));
    return template;
}

/**
 * Adds a new estimate template.
 * In a real app, this would use addDoc.
 * @param templateData The data for the new template.
 * @returns The ID of the newly created template.
 */
export async function addEstimateTemplate(templateData: { title: string, lineItems: LineItem[], gbbTier: GbbTier | null }): Promise<string> {
    console.log("Adding new estimate template:", templateData);
    const newId = `template_${Math.random().toString(36).substring(2, 9)}`;
    const newTemplate: EstimateTemplate = {
        id: newId,
        ...templateData
    };
    templates.push(newTemplate);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Added template with id: ${newId}`);
    return newId;
}

/**
 * Updates an existing estimate template.
 * @param updatedTemplate The template object with updated fields.
 */
export async function updateEstimateTemplate(updatedTemplate: EstimateTemplate): Promise<void> {
    console.log("Updating estimate template in DB:", updatedTemplate.id);
    const index = templates.findIndex(t => t.id === updatedTemplate.id);
    if (index !== -1) {
        templates[index] = updatedTemplate;
    } else {
        console.warn(`Template with id ${updatedTemplate.id} not found for update, adding it instead.`);
        templates.unshift(updatedTemplate);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
}
