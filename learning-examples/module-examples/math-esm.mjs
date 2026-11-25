/**
 * ECMAScript Modules (ESM) Example - Helper
 * Exports calculation functions using native `export`
 */

export function calculateTotalCookingTime(prepMinutes, cookMinutes) {
  return prepMinutes + cookMinutes;
}

export function calculateServingsMultiplier(originalServings, desiredServings) {
  return desiredServings / originalServings;
}

export const KITCHEN_TEMPERATURE_STANDARD_C = 200;
