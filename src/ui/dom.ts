export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function button(text: string, action: () => void, className = '') {
  const node = element('button', className, text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing application element: ${id}`);
  return node as T;
}

export function asset(name: string) { return `assets/${name}`; }

export function image(name: string, className = '') {
  const node = element('img', className);
  node.src = asset(name);
  node.alt = '';
  node.draggable = false;
  return node;
}
