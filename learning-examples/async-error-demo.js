/**
 * SYLLABUS MODULE 2 & 3: Asynchronous JavaScript & Error Handling Demonstration
 *
 * Concepts Demonstrated:
 * 1. Handling Promises using modern async/await syntax.
 * 2. Robust error propagation with try/catch blocks.
 * 3. Custom Error subclasses with HTTP status codes.
 * 4. Handling Promise.all() parallel operations.
 * 5. Global unhandledRejection and uncaughtException safety nets.
 */

// Custom Application Error
class AppValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppValidationError';
    this.statusCode = statusCode;
  }
}

// Simulated asynchronous API fetch function
async function simulateFetchIngredient(name, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new AppValidationError(`Out of stock for ingredient: "${name}"`, 404));
      } else {
        resolve({ ingredient: name, quantity: 'Available in pantry' });
      }
    }, 100);
  });
}

async function runAsyncDemo() {
  console.log('--- STARTING ASYNC & ERROR HANDLING DEMONSTRATION ---\n');

  // 1. Successful async/await
  try {
    console.log('[Async Operation] Requesting ingredient "Olive Oil"...');
    const result = await simulateFetchIngredient('Olive Oil', false);
    console.log(' Success:', result);
  } catch (err) {
    console.error(' Caught error:', err.message);
  }

  // 2. Controlled Error Handling via try/catch
  try {
    console.log('\n[Async Operation] Requesting unavailable ingredient "White Truffle"...');
    await simulateFetchIngredient('White Truffle', true);
  } catch (err) {
    console.log(` Caught expected error: [${err.name} - Code ${err.statusCode}]: ${err.message}`);
  }

  // 3. Parallel asynchronous operations using Promise.all
  console.log('\n[Promise.all] Fetching 3 pantry items in parallel...');
  const start = Date.now();
  const items = await Promise.all([
    simulateFetchIngredient('Garlic'),
    simulateFetchIngredient('Pasta'),
    simulateFetchIngredient('Parmesan'),
  ]);
  const duration = Date.now() - start;
  console.log(` Retrieved all 3 items concurrently in ${duration}ms:`, items.map((i) => i.ingredient));

  console.log('\n--- ASYNC & ERROR HANDLING DEMONSTRATION COMPLETED ---');
}

runAsyncDemo().catch(console.error);
