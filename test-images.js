import fs from 'fs';

const content = fs.readFileSync('src/data/questions.js', 'utf8');
const urlRegex = /'(https?:\/\/[^']+)'/g;
let match;
const urls = [];

while ((match = urlRegex.exec(content)) !== null) {
  urls.push(match[1]);
}

console.log(`Found ${urls.length} images to test.`);

let failures = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`❌ FAIL [${res.status}]: ${url}`);
      failures++;
    }
  } catch (err) {
    console.log(`❌ ERROR: ${url} (${err.message})`);
    failures++;
  }
}

console.log(`\nTests complete. ${urls.length} tested, ${failures} failures.`);
