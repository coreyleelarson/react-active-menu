import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

export interface UseActiveMenuOptions {
  offset?: number;
  onActiveChange?: (attributes: ActiveMenuAttributes) => void;
  scrollableElement?: HTMLElement;
}

export interface ActiveMenuAttributes {
  active?: string;
  isTransitioning: boolean;
  sectionRefs: Record<string, HTMLElement>;
  triggerRefs: Record<string, HTMLButtonElement>;
}

export interface ActiveMenu {
  active?: string;
  handleTriggerClick: (id: string) => (e: MouseEvent) => void;
  registerSectionRef: (id: string) => (ref: HTMLElement) => void;
  registerTriggerRef: (id: string) => (ref: HTMLButtonElement) => void;
}

export const useActiveMenu = (options: UseActiveMenuOptions = {}): ActiveMenu => {
  const { offset = 0, onActiveChange, scrollableElement = document.documentElement } = options;
  const [active, setActive] = useState<string>();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement>>({});

  const registerSectionRef = useCallback((id: string) => (ref: HTMLElement) => (sectionRefs.current[id] = ref), []);
  const registerTriggerRef = useCallback((id: string) => (ref: HTMLButtonElement) => (triggerRefs.current[id] = ref), []);
  const handleTriggerClick = useCallback(
    (id: string) => (e: MouseEvent) => {
      e.preventDefault();
      setIsTransitioning(true);

      const section = sectionRefs.current[id];

      if (section) {
        const targetOffset = scrollableElement.scrollTop + section.getBoundingClientRect().top - offset;

        // Scroll the body to the target section.
        window.scrollTo({
          behavior: 'smooth',
          top: targetOffset,
        });

        // Reset isTransitioning once smooth scrolling has completed.
        let interval = setInterval(() => {
          if (scrollableElement.scrollTop === targetOffset) {
            clearInterval(interval);
            setIsTransitioning(false);
          }
        });
      }
    },
    [offset]
  );

  // Detect active section on scroll.
  useEffect(() => {
    const detectActiveSection = () => {
      let closestId;
      let closestDimension;

      for (const [id, section] of Object.entries(sectionRefs.current)) {
        const { top } = section.getBoundingClientRect();
        if (!closestDimension || (top <= offset && top > closestDimension)) {
          closestDimension = top;
          closestId = id;
        }
      }

      setActive(closestId);
    };

    detectActiveSection();
    window.addEventListener('scroll', detectActiveSection);

    return () => {
      window.removeEventListener('scroll', detectActiveSection);
    };
  }, [offset]);

  // Trigger active change callback.
  useEffect(() => {
    if (!isTransitioning) {
      onActiveChange?.({
        active,
        isTransitioning: isTransitioning,
        sectionRefs: sectionRefs.current,
        triggerRefs: triggerRefs.current,
      });
    }
  }, [active, isTransitioning, onActiveChange, sectionRefs, triggerRefs]);

  return { active, handleTriggerClick, registerSectionRef, registerTriggerRef };
};
