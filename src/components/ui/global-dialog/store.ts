import { create } from "zustand";
import { ReactNode } from "react";

export type GlobalDialogVariant = "default" | "fullscreen" | "scrollUp";

export interface GlobalDialogOptions {
  variant?: GlobalDialogVariant;
  className?: string;
  maxWidth?: string; // e.g. "max-w-2xl"
  showCloseButton?: boolean;
}

interface GlobalDialogState {
  isOpen: boolean;
  view: ReactNode | null;
  options: GlobalDialogOptions;
  open: (view: ReactNode, options?: GlobalDialogOptions) => void;
  close: () => void;
}

export const useGlobalDialogStore = create<GlobalDialogState>((set) => ({
  isOpen: false,
  view: null,
  options: {},
  open: (view, options = {}) =>
    setTimeout(() => {
      set({
        isOpen: true,
        view,
        options,
      });
    }, 0),
  close: () => set({ isOpen: false }),
}));
