import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** The header's right-hand slot, where the stepper sits on results views. */
export const HeaderActionsSlot = createContext<HTMLElement | null>(null);

// Screens render their Back / Continue controls here so they keep their own
// state and handlers while the controls sit in the sticky header.
export const HeaderActions = ({ children }: { children: ReactNode }) => {
  const slot = useContext(HeaderActionsSlot);
  return slot ? createPortal(children, slot) : null;
};
