
import type { LineItem, Estimate } from "@/lib/types";

export type EstimateTemplate = {
    id: string;
    title: string;
    lineItems: LineItem[];
    gbbTier?: Estimate['gbbTier'];
}

export const estimateTemplates: EstimateTemplate[] = [
    {
        id: 'template-wh-install',
        title: 'Water Heater Installation',
        lineItems: [
            { description: 'Bradford White 50-Gallon Gas Water Heater', quantity: 1, unitPrice: 1200 },
            { description: 'Installation Labor', quantity: 4, unitPrice: 150 },
            { description: 'New Gas Line & Fittings', quantity: 1, unitPrice: 250 },
            { description: 'Haul Away Old Unit', quantity: 1, unitPrice: 75 },
        ],
        gbbTier: {
            good: 'Install a standard 50-gallon gas water heater with a 6-year warranty. Includes basic code compliance and haul-away of the old unit.',
            better: 'Install a high-efficiency 50-gallon gas water heater with an 8-year warranty. Includes a new expansion tank and upgraded shut-off valve.',
            best: 'Install a premium, condensing tankless water heater for endless hot water and maximum energy savings. Includes a 12-year warranty and a whole-home plumbing inspection.',
        }
    },
    {
        id: 'template-ac-diag',
        title: 'A/C System Diagnosis',
        lineItems: [
            { description: 'HVAC Diagnostic Fee', quantity: 1, unitPrice: 99 },
        ],
        gbbTier: {
            good: 'Perform a full system diagnostic to identify the root cause of the issue. Provide a detailed report of findings and a quote for necessary repairs.',
            better: 'Includes the diagnostic plus a basic refrigerant level check and top-off (up to 1lb of R-410A) and a standard filter replacement.',
            best: 'Includes the diagnostic, refrigerant service, a new filter, and a comprehensive coil cleaning (indoor and outdoor) to restore system efficiency.',
        }
    },
    {
        id: 'template-repipe',
        title: 'Whole Home Repipe',
        lineItems: [
            { description: 'PEX-A Piping for Whole Home', quantity: 200, unitPrice: 5 },
            { description: 'Labor for Repipe', quantity: 40, unitPrice: 150 },
            { description: 'Drywall Repair & Patching', quantity: 1, unitPrice: 2500 },
            { description: 'Permits and Inspection', quantity: 1, unitPrice: 500 },
        ],
        gbbTier: {
            good: 'Repipe the entire home with standard PEX-B tubing. Includes drywall access cuts and basic patching (not textured or painted).',
            better: 'Repipe using superior PEX-A tubing and install new quarter-turn shut-off valves at all fixtures. Includes professional drywall repair with texture matching.',
            best: 'Repipe with PEX-A, new valves, and include a new whole-home water filtration system and a pressure-reducing valve (PRV) for ultimate protection and water quality. Includes professional drywall repair, texture, and primer.',
        }
    },
];
