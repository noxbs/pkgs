const list = document.querySelector('#list');
const template = document.querySelector('#package-template');
const search = document.querySelector('#search');

let packages = [];

function render(items) {
  list.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'package-description';
    empty.textContent = packages.length === 0
      ? 'No packages are listed yet.'
      : 'No packages match your search.';
    list.appendChild(empty);
    return;
  }

  for (const item of items) {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector('.package-name').textContent = item.name;
    fragment.querySelector('.package-description').textContent = item.description ?? 'No description provided.';
    fragment.querySelector('.package-language').textContent = item.language ?? 'unknown';
    const source = fragment.querySelector('.package-source');
    const githubSource = /^github:([^/]+)\/([^/]+)$/.exec(item.url);
    if (githubSource) {
      const link = document.createElement('a');
      link.href = `https://github.com/${encodeURIComponent(githubSource[1])}/${encodeURIComponent(githubSource[2])}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = item.url;
      source.appendChild(link);
    } else {
      source.textContent = item.url;
    }
    fragment.querySelector('.package-riders').textContent = item.riders?.commands?.join(', ') ?? 'none';
    const install = fragment.querySelector('.package-install');
    const command = `nox install pkgs:${item.name}`;
    install.textContent = command;
    install.setAttribute('aria-label', `Copy command: ${command}`);
    install.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(command);
        install.textContent = 'Copied!';
        install.setAttribute('aria-label', 'Install command copied');
      } catch {
        install.textContent = 'Copy failed';
        install.setAttribute('aria-label', 'Could not copy install command');
      }

      window.setTimeout(() => {
        install.textContent = command;
        install.setAttribute('aria-label', `Copy command: ${command}`);
      }, 1400);
    });
    list.appendChild(fragment);
  }
}

function filterPackages() {
  const query = search.value.trim().toLowerCase();
  const filtered = packages.filter((item) => {
    return item.name.toLowerCase().includes(query)
      || (item.description ?? '').toLowerCase().includes(query)
      || (item.language ?? '').toLowerCase().includes(query);
  });
  render(filtered);
}

async function loadRegistry() {
  const response = await fetch('./packages.json');
  if (!response.ok) {
    throw new Error(`Could not load package registry (${response.status}).`);
  }

  const registry = await response.json();
  if (!Array.isArray(registry.packages)) {
    throw new Error('The package registry must contain a packages array.');
  }

  packages = registry.packages;
  filterPackages();
}

search.addEventListener('input', filterPackages);

loadRegistry().catch((error) => {
  const message = document.createElement('p');
  message.className = 'package-description';
  message.textContent = error instanceof Error ? error.message : 'Could not load package registry.';
  list.replaceChildren(message);
});