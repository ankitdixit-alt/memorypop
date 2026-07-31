// Global type definitions for MemoryPop

interface Window {
  plausible?: (
    eventName: string,
    options?: {
      props?: Record<string, string | number | boolean>;
      callback?: () => void;
    }
  ) => void;
}
