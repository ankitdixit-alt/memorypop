import { useLayoutEffect } from 'react';

/**
 * Document-level export presentation mode.
 * Sets data-memorypop-export="true" on <html> to enable export-specific styles.
 *
 * Used to hide cookie banners, development overlays, and other document-level UI
 * that cannot be controlled by a single component's export flag.
 */
export function useExportPresentation(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    const previous = root.getAttribute('data-memorypop-export');

    root.setAttribute('data-memorypop-export', 'true');

    return () => {
      if (previous === null) {
        root.removeAttribute('data-memorypop-export');
      } else {
        root.setAttribute('data-memorypop-export', previous);
      }
    };
  }, [enabled]);
}
