export const f1 = (v: number): string => (Number.isNaN(v) ? '—' : v.toFixed(1));
export const f2 = (v: number): string => (Number.isNaN(v) ? '—' : v.toFixed(2));
export const pct = (v: number): string => (Number.isNaN(v) ? '—' : `${Math.round(v)}%`);
export const share = (rate: number, n: number): string => (n <= 12 ? `${Math.round(rate * n)} of ${n}` : `${Math.round(rate * 100)}%`);

export const withUnit = (v: number, unit?: string): string => {
  if (Number.isNaN(v)) return '—';
  switch (unit) {
    case '/5':
      return `${v.toFixed(1)} / 5`;
    case '%':
      return `${Number.isInteger(v) ? v : v.toFixed(1)}%`;
    case 'share':
      return `${Math.round(v * 100)}%`;
    case 'days':
      return `${Number.isInteger(v) ? v : v.toFixed(1)} days`;
    case '×':
      return `${v.toFixed(2)}×`;
    case 'mapped':
      return v.toFixed(2);
    case '':
      return v === 1 ? 'Yes' : v === 0 ? 'No' : String(v);
    default:
      return `${Number.isInteger(v) ? v : v.toFixed(1)}${unit ? ` ${unit}` : ''}`;
  }
};

export const opLabel: Record<string, string> = { '<=': '≤', '>=': '≥', '<': '<', '>': '>', '==': '=' };
