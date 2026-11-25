/**
 * CommonJS (CJS) Module Example - Consumer
 *
 * Characteristics:
 * - Uses `require()` function (synchronous loading).
 * - Uses `module.exports` or `exports`.
 * - Has global access to `__dirname` and `__filename`.
 * - Historically default in Node.js (prior to ECMAScript modules).
 */

console.log('--- STARTING COMMONJS (CJS) DEMONSTRATION ---\n');

// 1. Synchronously require the helper module
const {
  calculateTotalCookingTime,
  calculateServingsMultiplier,
  KITCHEN_TEMPERATURE_STANDARD_C,
} = require('./math-cjs.cjs');

// 2. Access CJS built-in variables
console.log(`[CJS Environment] __filename: ${__filename}`);
console.log(`[CJS Environment] __dirname:  ${__dirname}`);

// 3. Execute imported functions
const totalMinutes = calculateTotalCookingTime(20, 45);
const multiplier = calculateServingsMultiplier(4, 8);

console.log(`[CJS Execution] Total Cooking Time (20m + 45m): ${totalMinutes} minutes`);
console.log(`[CJS Execution] Scaling recipe from 4 to 8 servings: x${multiplier} ratio`);
console.log(`[CJS Execution] Standard Oven Temperature: ${KITCHEN_TEMPERATURE_STANDARD_C}°C`);

console.log('\n--- COMMONJS DEMONSTRATION COMPLETED ---');
