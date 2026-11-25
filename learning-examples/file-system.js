/**
 * SYLLABUS MODULE 2: Node.js File System & Path Modules Demonstration
 *
 * Concepts Demonstrated:
 * 1. Safe file path resolution with path.join() and path.resolve()
 * 2. Comparing legacy Callback API (fs) vs modern Promise API (fs/promises)
 * 3. Creating directories recursively with fs.mkdir()
 * 4. Writing files (fs.writeFile), reading files (fs.readFile), and appending data (fs.appendFile)
 * 5. Inspecting file metadata using fs.stat() (size, creation time, isDirectory)
 * 6. Cleaning up temporary test files with fs.unlink()
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFileSystemDemo() {
  console.log('--- STARTING FILE SYSTEM & PATH DEMONSTRATION ---\n');

  // 1. Path Demonstration
  const sampleFolder = path.join(__dirname, 'demo-scratch');
  const sampleFile = path.join(sampleFolder, 'sample-recipe.txt');

  console.log(`[Path Module] Current Directory: ${__dirname}`);
  console.log(`[Path Module] Joined Target Path: ${sampleFile}`);
  console.log(`[Path Module] File Extension:   ${path.extname(sampleFile)}`);
  console.log(`[Path Module] File Basename:    ${path.basename(sampleFile)}`);

  // 2. Create Directory
  console.log('\n[FS: mkdir] Creating scratch directory if missing...');
  await fs.mkdir(sampleFolder, { recursive: true });
  console.log(` Directory created: ${sampleFolder}`);

  // 3. Write File
  console.log('\n[FS: writeFile] Writing recipe data to file...');
  const initialContent = 'Recipe: Lemon Ricotta Pancakes\nServings: 4\nPrep Time: 15 minutes\n';
  await fs.writeFile(sampleFile, initialContent, 'utf8');
  console.log(' File written successfully.');

  // 4. Append Data
  console.log('\n[FS: appendFile] Appending secret ingredient...');
  const appendedContent = 'Secret Ingredient: Fresh Meyer lemon zest (1 tbsp)\n';
  await fs.appendFile(sampleFile, appendedContent, 'utf8');
  console.log(' Content appended.');

  // 5. Read File
  console.log('\n[FS: readFile] Reading file back into memory:');
  const fileContents = await fs.readFile(sampleFile, 'utf8');
  console.log('--------------------------------------------------');
  console.log(fileContents.trim());
  console.log('--------------------------------------------------');

  // 6. Inspect File Metadata using fs.stat
  console.log('\n[FS: stat] Inspecting file metadata:');
  const stats = await fs.stat(sampleFile);
  console.log(` File Size:       ${stats.size} bytes`);
  console.log(` Is File:         ${stats.isFile()}`);
  console.log(` Created At:      ${stats.birthtime.toISOString()}`);
  console.log(` Last Modified:   ${stats.mtime.toISOString()}`);

  // 7. Cleanup
  console.log('\n[FS: unlink] Cleaning up temporary test file...');
  await fs.unlink(sampleFile);
  await fs.rmdir(sampleFolder);
  console.log(' Temporary test files cleaned up successfully.');

  console.log('\n--- FILE SYSTEM DEMONSTRATION COMPLETED ---');
}

runFileSystemDemo().catch(console.error);
