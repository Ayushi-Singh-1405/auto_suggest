function lowerBound(sorted, prefix) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid].text < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function upperBound(sorted, prefix) {
  let lo = 0, hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid].text <= prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function createSearch(phrases) {
  let sorted = phrases.map(p => ({ text: p.text.toLowerCase(), weight: p.weight, original: p.text }))
    .sort((a, b) => a.text.localeCompare(b.text));

  function search(prefix, limit, weighted) {
    const lower = prefix.toLowerCase();
    const lo = lowerBound(sorted, lower);
    const hi = upperBound(sorted, lower + '\uffff');

    const matches = [];
    for (let i = lo; i < hi; i++) {
      matches.push({ text: sorted[i].original, weight: sorted[i].weight });
    }

    if (weighted) {
      matches.sort((a, b) => b.weight - a.weight);
    }

    return matches.slice(0, limit);
  }

  function reinitialize(newPhrases) {
    sorted = newPhrases.map(p => ({ text: p.text.toLowerCase(), weight: p.weight, original: p.text }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }

  return { search, reinitialize };
}

module.exports = { createSearch };
