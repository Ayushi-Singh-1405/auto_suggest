const express = require('express');

const VALID_ALGORITHMS = ['brute-force', 'binary-search', 'trie', 'gemini'];

function createRouter(phrases, algorithms) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const prefix = req.query.prefix;
    if (!prefix || typeof prefix !== 'string') {
      return res.status(400).json({ error: '"prefix" query parameter is required' });
    }

    const algorithm = req.query.algorithm;
    if (!algorithm || !VALID_ALGORITHMS.includes(algorithm)) {
      return res.status(400).json({ error: `"algorithm" must be one of: ${VALID_ALGORITHMS.join(', ')}` });
    }

    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit)) limit = 10;
    limit = Math.max(1, Math.min(50, limit));

    const weighted = req.query.weighted === 'true' || req.query.weighted === '1';

    const start = performance.now();

    try {
      let results;
      if (algorithm === 'gemini') {
        if (!algorithms.gemini) {
          return res.status(502).json({ error: 'Gemini unavailable: GEMINI_API_KEY not configured' });
        }
        results = await algorithms.gemini.search(prefix, limit);
      } else if (algorithm === 'binary-search') {
        results = algorithms.binary.search(prefix, limit, weighted);
      } else if (algorithm === 'trie') {
        results = algorithms.trie.search(prefix, limit, weighted);
      } else {
        results = algorithms.brute.search(prefix, limit, weighted);
      }

      const elapsedMs = Number((performance.now() - start).toFixed(2));

      res.json({
        prefix,
        algorithm,
        weighted,
        limit,
        count: results.length,
        results,
        elapsedMs,
      });
    } catch (err) {
      if (algorithm === 'gemini') {
        return res.status(502).json({ error: `Gemini API error: ${err.message}` });
      }
      throw err;
    }
  });

  return router;
}

module.exports = { createRouter };
