import type { Tab } from './reducer';

const tabs: Tab[] = ['overview', 'perspectives', 'findings', 'recommendations'];

export const parseHash = (hash: string): { tab: Tab; findingId: string | null } | null => {
  const h = hash.replace(/^#/, '');
  if (!h) return null;
  const [tab, rest] = h.split('/');
  if (!tabs.includes(tab as Tab)) return null;
  return { tab: tab as Tab, findingId: tab === 'findings' && rest ? rest : null };
};

export const writeHash = (tab: Tab, findingId: string | null, active: boolean) => {
  const next = active ? `#${tab}${tab === 'findings' && findingId ? `/${findingId}` : ''}` : '';
  if (window.location.hash !== next) {
    if (next) window.history.replaceState(null, '', next);
    else window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
};
