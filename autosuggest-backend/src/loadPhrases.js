const fs = require('fs');
const path = require('path');

function loadPhrases() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'phrases.json'), 'utf-8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data.phrases)) {
    throw new Error('phrases.json: expected a "phrases" array');
  }

  for (const item of data.phrases) {
    if (typeof item.text !== 'string' || typeof item.weight !== 'number') {
      throw new Error('phrases.json: each phrase must have a "text" (string) and "weight" (number)');
    }
  }

  console.log(`Loaded ${data.phrases.length} phrases`);
  return data.phrases;
}

module.exports = loadPhrases;
