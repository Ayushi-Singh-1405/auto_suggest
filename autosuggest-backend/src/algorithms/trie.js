function build(phrases) {
  const root = { children: {}, entries: [] };

  for (const p of phrases) {
    const text = p.text.toLowerCase();
    let node = root;
    for (const ch of text) {
      if (!node.children[ch]) node.children[ch] = { children: {}, entries: [] };
      node = node.children[ch];
    }
    node.entries.push({ text: p.text, weight: p.weight });
  }

  function dfs(node, collect) {
    for (const e of node.entries) collect.push(e);
    for (const ch in node.children) dfs(node.children[ch], collect);
  }

  function search(prefix, limit, weighted) {
    const lower = prefix.toLowerCase();
    let node = root;
    for (const ch of lower) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }

    const matches = [];
    dfs(node, matches);

    if (weighted) {
      matches.sort((a, b) => b.weight - a.weight);
    }

    return matches.slice(0, limit);
  }

  return { search };
}

module.exports = { build };
