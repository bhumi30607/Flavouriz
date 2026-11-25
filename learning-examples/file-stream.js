/**
 * SYLLABUS MODULE 2: Node.js Streams Demonstration
 *
 * Concepts Demonstrated:
 * 1. Why streams matter: Processing large files chunk-by-chunk without loading all data into RAM.
 * 2. fs.createReadStream() - Readable stream producing data events.
 * 3. fs.createWriteStream() - Writable stream receiving chunks.
 * 4. stream.Transform - Processing and transforming data on the fly (e.g. Uppercase filter).
 * 5. stream.pipeline() or .pipe() - Safely wiring streams together with automatic error management.
 */

import fs from 'fs';
import { Transform, pipeline } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFilePath = path.join(__dirname, 'stream-source.txt');
const destFilePath = path.join(__dirname, 'stream-destination.txt');

// Step 1: Create a sample input file for the demonstration
const sampleRecipeLog = `
[KITCHEN DISPATCH LOG]
Step 1: Roast 500g ripe tomatoes at 200°C for 20 minutes.
Step 2: Sauté minced shallots and garlic in cold-pressed olive oil.
Step 3: Immersion blend roasted tomatoes until silky smooth.
Step 4: Garnish with fresh micro-basil and warm crusty baguette.
[DISPATCH COMPLETE]
`.trim();

fs.writeFileSync(sourceFilePath, sampleRecipeLog, 'utf8');
console.log('--- STARTING NODE.JS STREAMS DEMONSTRATION ---\n');
console.log(` Created sample file for streaming: ${sourceFilePath}`);

// Step 2: Create a Transform Stream to convert text to uppercase
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    // Transform incoming binary chunk to uppercase string buffer
    const transformedChunk = chunk.toString().toUpperCase();
    callback(null, Buffer.from(transformedChunk));
  },
});

// Step 3: Create readable and writable streams
const readStream = fs.createReadStream(sourceFilePath, { highWaterMark: 64 }); // 64-byte chunks
const writeStream = fs.createWriteStream(destFilePath);

let chunkIndex = 0;
readStream.on('data', (chunk) => {
  chunkIndex++;
  console.log(`[Read Stream] Read Chunk #${chunkIndex} (${chunk.length} bytes): "${chunk.toString().slice(0, 25).trim()}..."`);
});

// Step 4: Pipe streams together: ReadStream -> Transform -> WriteStream
pipeline(readStream, upperCaseTransform, writeStream, (err) => {
  if (err) {
    console.error(' Stream Pipeline encountered an error:', err);
  } else {
    console.log('\n✅ Pipeline finished successfully! All data streamed and transformed.');
    
    // Read destination result
    const transformedResult = fs.readFileSync(destFilePath, 'utf8');
    console.log('\n--- Transformed Output File Content ---');
    console.log(transformedResult);
    console.log('---------------------------------------');

    // Clean up temporary demonstration files
    fs.unlinkSync(sourceFilePath);
    fs.unlinkSync(destFilePath);
    console.log(' Cleaned up stream temporary files.');
    console.log('\n--- STREAMS DEMONSTRATION COMPLETED ---');
  }
});
