/**
 * ECMAScript Modules (ESM) Example - Consumer
 *
 * Characteristics:
 * - Uses static `import ... from '...'` syntax (asynchronous parsing phase).
 * - Standardized JavaScript standard supported in both modern Browsers & Node.js.
 * - Does NOT have `__dirname` or `__filename` globals; uses `import.meta.url` instead.
 * - Supports Top-Level `await`.
 */

import {
  calculateTotalCookingTime,
  calculateServingsMultiplier,
  KITCHEN_TEMPERATURE_STANDARD_C,
} from './math-esm.mjs';

import path from 'path';
import { fileURLToPath } from 'url';

console.log('--- STARTING ECMASCRIPT MODULES (ESM) DEMONSTRATION ---\n');

// In ESM, derive filename and dirname via import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`[ESM Environment] import.meta.url: ${import.meta.url}`);
console.log(`[ESM Environment] Derived __filename: ${__filename}`);
console.log(`[ESM Environment] Derived __dirname:  ${__dirname}`);

// Execute imported functions
const totalMinutes = calculateTotalCookingTime(15, 30);
const multiplier = calculateServingsMultiplier(2, 6);

console.log(`[ESM Execution] Total Cooking Time (15m + 30m): ${totalMinutes} minutes`);
console.log(`[ESM Execution] Scaling recipe from 2 to 6 servings: x${multiplier} ratio`);
console.log(`[ESM Execution] Standard Oven Temperature: ${KITCHEN_TEMPERATURE_STANDARD_C}°C`);

// Demonstrating Top-Level Await (unique capability of ESM!)
console.log('\n[ESM Feature] Demonstrating native Top-Level Await:');
await new Promise((resolve) => setTimeout(resolve, 100));
console.log(' Top-level await resolved without wrapping in an async IIFE function.');

console.log('\n--- ESM DEMONSTRATION COMPLETED ---');
