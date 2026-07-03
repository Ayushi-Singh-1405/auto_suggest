const searchInput = document.getElementById('search');
const suggestionsList = document.getElementById('suggestions');
const algorithmSelect = document.getElementById('algorithm');
const weightedCheckbox = document.getElementById('weighted');

let timer = null;
let selectedIndex = -1;

async function fetchSuggestions() {
  const prefix = searchInput.value.trim();
  if (!prefix) {
    suggestionsList.style.display = 'none';
    return;
  }

  const params = new URLSearchParams({
    prefix,
    algorithm: algorithmSelect.value,
    limit: 10,
    weighted: weightedCheckbox.checked,
  });

  try {
    const res = await fetch('/api/autosuggest?' + params);
    if (!res.ok) return;
    const data = await res.json();
    renderResults(data.results || []);
  } catch {
    // ignore
  }
}

function renderResults(results) {
  suggestionsList.innerHTML = '';
  if (results.length === 0) {
    suggestionsList.style.display = 'none';
    return;
  }

  for (const item of results) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(item.text)}</span><span class="weight">${item.weight}</span>`;
    suggestionsList.appendChild(li);
  }

  suggestionsList.style.display = 'block';
  selectedIndex = -1;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

searchInput.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(fetchSuggestions, 200);
});

searchInput.addEventListener('keydown', (e) => {
  const items = suggestionsList.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    items.forEach((li, i) => li.style.background = i === selectedIndex ? '#e0e0e0' : '');
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, -1);
    items.forEach((li, i) => li.style.background = i === selectedIndex ? '#e0e0e0' : '');
  } else if (e.key === 'Enter' && selectedIndex >= 0) {
    e.preventDefault();
    searchInput.value = items[selectedIndex].querySelector('span').textContent;
    suggestionsList.style.display = 'none';
  }
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => { suggestionsList.style.display = 'none'; }, 150);
});

searchInput.addEventListener('focus', () => {
  if (suggestionsList.children.length > 0) {
    suggestionsList.style.display = 'block';
  }
});

algorithmSelect.addEventListener('change', fetchSuggestions);
weightedCheckbox.addEventListener('change', fetchSuggestions);
