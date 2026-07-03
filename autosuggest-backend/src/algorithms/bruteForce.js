function search(phrases, prefix, limit, weighted) {
  const lower = prefix.toLowerCase();
  const matches = phrases.filter(p => p.text.toLowerCase().startsWith(lower));

  if (weighted) {
    matches.sort((a, b) => b.weight - a.weight);
  }

  return matches.slice(0, limit).map(p => ({ text: p.text, weight: p.weight }));
}

module.exports = { search };
