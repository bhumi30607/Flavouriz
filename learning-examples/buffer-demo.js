/**
 * SYLLABUS MODULE 2: Node.js Buffer Demonstration
 *
 * Concepts Demonstrated:
 * 1. What is a Buffer? Fixed-length sequence of raw binary bytes allocated outside the V8 heap.
 * 2. Buffer.from() - Creating buffers from strings, arrays, or existing buffers.
 * 3. Buffer.alloc() - Safely allocating zero-filled memory buffers.
 * 4. Encoding & Decoding: Converting between utf-8, hex, and base64.
 * 5. Buffer.byteLength() vs String.length (critical for multi-byte Unicode characters).
 * 6. Buffer slicing and copying.
 */

console.log('--- STARTING NODE.JS BUFFER DEMONSTRATION ---\n');

// 1. Creating a buffer from a string
const recipeWord = 'Flavouriz 🍕';
const buffer1 = Buffer.from(recipeWord, 'utf8');

console.log(`[Buffer.from] Original String: "${recipeWord}"`);
console.log(`[Buffer.from] Raw Bytes (Hex): `, buffer1);
console.log(`[Buffer.from] Buffer Length:    ${buffer1.length} bytes`);
console.log(`[Buffer.from] String Length:    ${recipeWord.length} characters`);
console.log(` Notice: The pizza emoji "🍕" takes 4 bytes in UTF-8, making byte length larger than char length!\n`);

// 2. Encoding conversions (Base64 and Hex)
const base64Encoded = buffer1.toString('base64');
const hexEncoded = buffer1.toString('hex');
console.log(`[Encoding] Base64 representation: ${base64Encoded}`);
console.log(`[Encoding] Hex representation:    ${hexEncoded}`);

// Decoding back from Base64
const decodedBuffer = Buffer.from(base64Encoded, 'base64');
console.log(`[Decoding] Decoded from Base64:   "${decodedBuffer.toString('utf8')}"\n`);

// 3. Allocating fixed size buffer
const allocatedBuffer = Buffer.alloc(10); // 10 bytes initialized to zero
console.log(`[Buffer.alloc] 10 Zero-filled Bytes:`, allocatedBuffer);

// Writing into allocated buffer
allocatedBuffer.write('Chef');
console.log(`[Buffer.write] After writing "Chef":`, allocatedBuffer);
console.log(`[Buffer.toString] Read back: "${allocatedBuffer.toString('utf8', 0, 4)}"\n`);

// 4. Buffer Concatenation
const bufA = Buffer.from('Tomato ');
const bufB = Buffer.from('Basil ');
const bufC = Buffer.from('Mozzarella');
const combined = Buffer.concat([bufA, bufB, bufC]);

console.log(`[Buffer.concat] Combined Buffer: "${combined.toString('utf8')}"`);
console.log(`[Buffer.concat] Total Bytes:     ${combined.length} bytes`);

console.log('\n--- BUFFER DEMONSTRATION COMPLETED ---');
