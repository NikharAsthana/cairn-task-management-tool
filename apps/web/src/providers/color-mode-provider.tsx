// apps/web/src/providers/color-mode-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

export type ColorMode = "black" | "amber" | "blue" | "pink" | "rose" | "emerald";

const STORAGE_KEY = "color-mode";
const DEFAULT_COLOR_MODE: ColorMode = "black";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): ColorMode {
  return (localStorage.getItem(STORAGE_KEY) as ColorMode | null) ?? DEFAULT_COLOR_MODE;
}

// Server can never know a visitor's localStorage — same reasoning as
// next-themes' "wait until mounted" pattern from Phase 7. Default to
// "black" (the base palette) on the server; the real value takes over
// the instant this hook runs in the browser.
function getServerSnapshot(): ColorMode {
  return DEFAULT_COLOR_MODE;
}

interface ColorModeContextValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const colorMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // This effect is fine — it mutates the actual DOM, not React state. The
  // lint rule only objects to calling *setState* inside an effect; a real
  // browser side-effect (updating an attribute) is what useEffect is for.
  useEffect(() => {
    document.documentElement.setAttribute("data-color-mode", colorMode);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    // useSyncExternalStore only re-renders on the browser's native "storage"
    // event, which only fires in *other* tabs — never the tab that made the
    // change. Dispatching it manually here notifies this tab's own
    // subscribers immediately too.
    window.dispatchEvent(new Event("storage"));
  }, []);

  return (
    <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return ctx;
}