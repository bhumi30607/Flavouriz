/**
 * CommonJS (CJS) Module Example - Helper
 * Exports calculation functions using module.exports
 */

function calculateTotalCookingTime(prepMinutes, cookMinutes) {
  return prepMinutes + cookMinutes;
}

function calculateServingsMultiplier(originalServings, desiredServings) {
  return desiredServings / originalServings;
}

const KITCHEN_TEMPERATURE_STANDARD_C = 200;

module.exports = {
  calculateTotalCookingTime,
  calculateServingsMultiplier,
  KITCHEN_TEMPERATURE_STANDARD_C,
};
