require('dotenv').config();
const express = require('express');
const cors = require('cors');
const loadPhrases = require('./loadPhrases');
const { search: bruteForceSearch } = require('./algorithms/bruteForce');
const { createSearch } = require('./algorithms/binarySearch');
const { build: buildTrie } = require('./algorithms/trie');
const { build: buildGemini } = require('./algorithms/gemini');
const { createRouter } = require('./routes/autosuggest');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const phrases = loadPhrases();

let t = performance.now();
const binarySearchAlgo = createSearch(phrases);
console.log(`Binary-search index built in ${(performance.now() - t).toFixed(2)}ms`);

t = performance.now();
const trieAlgo = buildTrie(phrases);
console.log(`Trie built in ${(performance.now() - t).toFixed(2)}ms`);

let geminiAlgo;
try {
  geminiAlgo = buildGemini(phrases);
} catch {
  console.log('Gemini unavailable (GEMINI_API_KEY not set)');
}

const algorithms = {
  brute: { search: (prefix, limit, weighted) => bruteForceSearch(phrases, prefix, limit, weighted) },
  binary: binarySearchAlgo,
  trie: trieAlgo,
  gemini: geminiAlgo,
};

app.use(express.static('public'));

app.use('/api/autosuggest', createRouter(phrases, algorithms));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
