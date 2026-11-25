import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Educational Note for Syllabus (Module 2: File System & Path Modules):
 * This service implements simple JSON file persistence using Node.js core 'fs/promises' and 'path'.
 * To prevent race conditions and partial file corruption, write operations are queued per collection
 * and written atomically using temporary files before replacement.
 *
 * COLLECTIONS:
 * - users.json
 * - recipes.json
 * - favorites.json
 * - reviews.json
 * - comments.json
 * - reports.json
 */

const COLLECTIONS = [
  'users',
  'recipes',
  'favorites',
  'reviews',
  'comments',
  'reports'
];

// Per-collection write lock queue to prevent race conditions
const writeQueues = new Map();

function getCollectionPath(collectionName) {
  return path.join(config.dataDir, `${collectionName}.json`);
}

/**
 * Initialize storage files if they do not exist
 */
export async function initStorage() {
  try {
    if (!existsSync(config.dataDir)) {
      await fs.mkdir(config.dataDir, { recursive: true });
    }
    if (!existsSync(config.uploadsDir)) {
      await fs.mkdir(config.uploadsDir, { recursive: true });
    }

    for (const name of COLLECTIONS) {
      const filePath = getCollectionPath(name);
      if (!existsSync(filePath)) {
        await fs.writeFile(filePath, '[]\n', 'utf8');
      }
    }
  } catch (error) {
    console.error('Failed to initialize JSON storage files:', error);
    throw error;
  }
}

/**
 * Read all records from a collection
 * @param {string} collectionName
 * @returns {Promise<Array>}
 */
export async function readAll(collectionName) {
  const filePath = getCollectionPath(collectionName);
  try {
    if (!existsSync(filePath)) {
      await fs.writeFile(filePath, '[]\n', 'utf8');
      return [];
    }
    const rawData = await fs.readFile(filePath, 'utf8');
    if (!rawData.trim()) {
      return [];
    }
    return JSON.parse(rawData);
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error(`Malformed JSON detected in ${collectionName}.json. Resetting or handling error.`, error);
      // Backup corrupted file
      const backupPath = `${filePath}.corrupt.${Date.now()}`;
      await fs.copyFile(filePath, backupPath).catch(() => {});
      return [];
    }
    throw error;
  }
}

/**
 * Write all records safely with queue-based concurrency protection
 * @param {string} collectionName
 * @param {Array} data
 */
export async function writeAll(collectionName, data) {
  if (!Array.isArray(data)) {
    throw new Error(`Data for collection "${collectionName}" must be an array.`);
  }

  const previousOperation = writeQueues.get(collectionName) || Promise.resolve();

  const writeOperation = previousOperation.then(async () => {
    const filePath = getCollectionPath(collectionName);
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    const serializedData = JSON.stringify(data, null, 2);

    try {
      // Step 1: Write to temporary file
      await fs.writeFile(tempPath, serializedData, 'utf8');
      // Step 2: Atomic rename replaces original file
      await fs.rename(tempPath, filePath);
    } catch (err) {
      // Clean up temp file on failure
      try {
        if (existsSync(tempPath)) {
          await fs.unlink(tempPath);
        }
      } catch (_) {}
      throw err;
    }
  });

  writeQueues.set(collectionName, writeOperation);
  return writeOperation;
}

/**
 * Find single item by ID
 */
export async function findById(collectionName, id) {
  const items = await readAll(collectionName);
  return items.find((item) => String(item.id) === String(id)) || null;
}

/**
 * Find items matching predicate function
 */
export async function find(collectionName, predicate) {
  const items = await readAll(collectionName);
  return items.filter(predicate);
}

/**
 * Find first item matching predicate function
 */
export async function findOne(collectionName, predicate) {
  const items = await readAll(collectionName);
  return items.find(predicate) || null;
}

/**
 * Create a new record
 */
export async function create(collectionName, record) {
  const items = await readAll(collectionName);
  const now = new Date().toISOString();
  const newItem = {
    id: record.id || crypto.randomUUID(),
    ...record,
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || now,
  };
  items.push(newItem);
  await writeAll(collectionName, items);
  return newItem;
}

/**
 * Update an existing record by ID
 */
export async function updateById(collectionName, id, updates) {
  const items = await readAll(collectionName);
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return null;
  }
  const updatedItem = {
    ...items[index],
    ...updates,
    id: items[index].id, // Prevent ID overwrite
    updatedAt: new Date().toISOString(),
  };
  items[index] = updatedItem;
  await writeAll(collectionName, items);
  return updatedItem;
}

/**
 * Delete a record by ID
 */
export async function deleteById(collectionName, id) {
  const items = await readAll(collectionName);
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    return false;
  }
  const [deletedItem] = items.splice(index, 1);
  await writeAll(collectionName, items);
  return deletedItem;
}

/**
 * Count items matching predicate (or all if no predicate)
 */
export async function count(collectionName, predicate) {
  const items = await readAll(collectionName);
  if (!predicate) return items.length;
  return items.filter(predicate).length;
}
