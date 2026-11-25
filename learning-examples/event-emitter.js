/**
 * SYLLABUS MODULE 2: Node.js EventEmitter Demonstration
 *
 * Concepts Demonstrated:
 * 1. Importing core 'events' module and extending EventEmitter.
 * 2. Registering synchronous and asynchronous event listeners via .on()
 * 3. One-time listeners via .once()
 * 4. Emitting custom domain events with payload arguments via .emit()
 * 5. Checking listener counts and inspecting active event names.
 * 6. Proper error event handling.
 */

import { EventEmitter } from 'events';

// Create a custom kitchen notification emitter
class KitchenNotificationSystem extends EventEmitter {
  notifyRecipePublished(recipe) {
    console.log(`\n📢 [Kitchen Emitter] Emitting "recipe:published" event for: "${recipe.title}"`);
    this.emit('recipe:published', recipe);
  }

  notifyReviewAdded(recipeTitle, rating, reviewer) {
    console.log(`⭐ [Kitchen Emitter] Emitting "review:added" event for: "${recipeTitle}"`);
    this.emit('review:added', { recipeTitle, rating, reviewer, timestamp: new Date() });
  }

  notifyCriticalError(err) {
    console.log(`🚨 [Kitchen Emitter] Emitting "error" event!`);
    this.emit('error', err);
  }
}

const kitchenEmitter = new KitchenNotificationSystem();

// Listener 1: Send in-app notification
kitchenEmitter.on('recipe:published', (recipe) => {
  console.log(`   [Listener: Notification] Alerting followers of ${recipe.author}: new recipe live!`);
});

// Listener 2: Update search index
kitchenEmitter.on('recipe:published', (recipe) => {
  console.log(`   [Listener: Search Engine] Indexing recipe ID ${recipe.id} for keyword search.`);
});

// Listener 3: One-time welcome listener using .once()
kitchenEmitter.once('recipe:published', () => {
  console.log(`   [Listener: First Publish Bonus] Congratulations on publishing your first recipe!`);
});

// Listener 4: Review listener
kitchenEmitter.on('review:added', ({ recipeTitle, rating, reviewer }) => {
  console.log(`   [Listener: Reviews] ${reviewer} rated "${recipeTitle}" with ${rating} stars!`);
});

// Listener 5: Error event listener (crucial in Node.js to avoid unhandled exceptions)
kitchenEmitter.on('error', (err) => {
  console.error(`   [Listener: Error Handler] Caught EventEmitter error:`, err.message);
});

// DEMONSTRATION RUN
console.log('--- STARTING EVENT EMITTER DEMONSTRATION ---');

// Trigger First Event
kitchenEmitter.notifyRecipePublished({
  id: 101,
  title: 'Crispy Neapolitan Pizza',
  author: 'Chef Alessandro',
});

// Trigger Second Event (Notice: .once() listener will NOT fire this second time)
kitchenEmitter.notifyRecipePublished({
  id: 102,
  title: 'Classic Tiramisu',
  author: 'Sarah Jenkins',
});

// Trigger Review Event
kitchenEmitter.notifyReviewAdded('Crispy Neapolitan Pizza', 5, 'Alex Rivera');

// Inspect active listeners count
console.log(`\n📊 Active listeners for "recipe:published": ${kitchenEmitter.listenerCount('recipe:published')}`);
console.log(`📊 Active event names:`, kitchenEmitter.eventNames());

// Error Event
kitchenEmitter.notifyCriticalError(new Error('Simulated stove temperature sensor offline'));

console.log('\n--- EVENT EMITTER DEMONSTRATION COMPLETED ---');
