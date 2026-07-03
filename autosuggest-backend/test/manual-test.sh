#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"

echo "=== brute-force ==="
curl -s "${BASE}/api/autosuggest?prefix=hel&algorithm=brute-force&limit=5&weighted=true" | jq .

echo
echo "=== binary-search ==="
curl -s "${BASE}/api/autosuggest?prefix=hel&algorithm=binary-search&limit=5&weighted=true" | jq .

echo
echo "=== trie ==="
curl -s "${BASE}/api/autosuggest?prefix=hel&algorithm=trie&limit=5&weighted=true" | jq .

echo
echo "=== gemini ==="
curl -s "${BASE}/api/autosuggest?prefix=hel&algorithm=gemini&limit=5&weighted=true" | jq .
