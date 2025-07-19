import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tiered-estimates.ts';
import '@/ai/flows/suggest-parts.ts';
import '@/ai/flows/generate-price.ts';
