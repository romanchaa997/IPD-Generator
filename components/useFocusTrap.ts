import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A custom React hook to trap focus within a container element.
 * When active, it prevents tabbing outside of the container.
 * @param active - A boolean to activate or deactivate the focus trap.
 */
export const useFocusTrap = <T extends HTMLElement>(active: boolean) => {
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) {
        return;
      }

      const focusableElements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
      // FIX: Cast `el` to HTMLElement to explicitly type it, resolving the error where `offsetParent` was accessed on an `unknown` type.
      ).filter(el => (el as HTMLElement).offsetParent !== null); // Ensure elements are visible

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentElement = document.activeElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (currentElement === firstElement || !containerRef.current.contains(currentElement as Node | null)) {
          event.preventDefault();
          // FIX: Cast `lastElement` to HTMLElement to explicitly type it, resolving the error where `focus` was called on an `unknown` type.
          (lastElement as HTMLElement).focus();
        }
      } else {
        // Tab
        if (currentElement === lastElement || !containerRef.current.contains(currentElement as Node | null)) {
          event.preventDefault();
          // FIX: Cast `firstElement` to HTMLElement to explicitly type it, resolving the error where `focus` was called on an `unknown` type.
          (firstElement as HTMLElement).focus();
        }
      }
    },
    []
  );

  useEffect(() => {
    if (active && containerRef.current) {
      // Focus the first focusable element in the trap when it becomes active.
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
      firstFocusable?.focus();

      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, handleKeyDown]);

  return containerRef;
};
