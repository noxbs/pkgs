const list = document.querySelector('#list');
const template = document.querySelector('#package-template');
const search = document.querySelector('#search');

let packages = [];

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

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
      const copied = await copyText(command);
      install.textContent = copied ? 'Copied!' : command;
      install.setAttribute('aria-label', copied ? 'Install command copied' : `Copy command: ${command}`);
      install.title = copied ? 'Copied to clipboard' : 'Clipboard access failed; select the command to copy it';

      window.setTimeout(() => {
        install.textContent = command;
        install.setAttribute('aria-label', `Copy command: ${command}`);
        install.title = 'Copy install command';
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