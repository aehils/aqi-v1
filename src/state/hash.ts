import type { Tab } from './reducer';

const tabs: Tab[] = ['overview', 'perspectives', 'findings', 'recommendations'];

export const parseHash = (hash: string): { tab: Tab; findingId: string | null } | null => {
  const h = hash.replace(/^#/, '');
  if (!h) return null;
  const [tab, rest] = h.split('/');
  if (!tabs.includes(tab as Tab)) return null;
  return { tab: tab as Tab, findingId: tab === 'findings' && rest ? rest : null };
};

// `push` adds a history entry so the browser's Back button can return to
// the previous stage; tab and finding changes replace the current entry.
export const writeHash = (tab: Tab, findingId: string | null, active: boolean, push = false) => {
  const next = active ? (findingId ? `#findings/${findingId}` : `#${tab}`) : '';
  if (window.location.hash === next) return;
  const url = next || window.location.pathname + window.location.search;
  if (push) window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
};
