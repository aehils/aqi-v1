import type { Band } from '../../data/types';
import { bandLabel } from '../../engine/bands';

export const BandTag = ({ band, title }: { band: Band; title?: string }) => (
  <span className={`band band--${band}`} title={title}>
    {bandLabel[band]}
  </span>
);
