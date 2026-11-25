/**
 * SYLLABUS MODULE 2: Node.js Event Loop & Global Objects Demonstration
 *
 * Concepts Demonstrated:
 * 1. Synchronous execution on the V8 Call Stack.
 * 2. Microtask Queue Phase:
 *    - Priority 1: process.nextTick() (executed immediately after current operation)
 *    - Priority 2: Promise.then() microtasks
 * 3. Macrotask Phases of Node.js Event Loop:
 *    - Timers Phase: setTimeout() & setInterval()
 *    - Check Phase: setImmediate()
 * 4. Node.js Global Objects:
 *    - process (environment, argv, uptime, memoryUsage, platform)
 *    - global (root execution context)
 */

console.log('--- STARTING NODE.JS EVENT LOOP PHASES DEMONSTRATION ---\n');

// Synchronous 1
console.log('1. [Synchronous] Code start on Call Stack.');

// Timers Phase Macrotask
setTimeout(() => {
  console.log('7. [Event Loop - Timers Phase] setTimeout(0ms) callback executed.');
}, 0);

// Check Phase Macrotask
setImmediate(() => {
  console.log('8. [Event Loop - Check Phase] setImmediate() callback executed.');
});

// Microtask Queue: Promise
Promise.resolve().then(() => {
  console.log('4. [Microtask Queue - Promise.then] Microtask resolved.');
}).then(() => {
  console.log('5. [Microtask Queue - Chained Promise.then] Second microtask resolved.');
});

// Microtask Queue: process.nextTick (HIGHEST PRIORITY in Node.js)
process.nextTick(() => {
  console.log('3. [Microtask Queue - process.nextTick] Highest priority microtask executed.');
});

// Synchronous 2
console.log('2. [Synchronous] Code end on Call Stack.');

// Inspecting Node.js Globals
setTimeout(() => {
  console.log('\n--- NODE.JS GLOBAL OBJECTS INSPECTION ---');
  console.log(`[Global Object] Node Version:    ${process.version}`);
  console.log(`[Global Object] Platform:        ${process.platform}`);
  console.log(`[Global Object] Process ID (PID): ${process.pid}`);
  console.log(`[Global Object] Memory Usage:    RSS ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[Global Object] Uptime:          ${process.uptime()} seconds`);
  console.log('-----------------------------------------\n');
}, 50);
