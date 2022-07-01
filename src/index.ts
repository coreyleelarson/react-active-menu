import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseActiveMenuOptions {
  offset?: number;
  onActiveChange?: (attributes: ActiveMenuAttributes) => void;
  scrollableElement?: HTMLElement | null;
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
  const { offset = 0, onActiveChange, scrollableElement } = options;
  const [active, setActive] = useState<string>();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const scrollableContainer = useMemo(() => scrollableElement || document.documentElement, [scrollableElement]);

  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement>>({});

  const registerSectionRef = useCallback((id: string) => (ref: HTMLElement) => (sectionRefs.current[id] = ref), []);
  const registerTriggerRef = useCallback((id: string) => (ref: HTMLButtonElement) => (triggerRefs.current[id] = ref), []);
  const handleTriggerClick = useCallback(
    (id: string) => (e: MouseEvent) => {
      e.preventDefault();
      setIsTransitioning(true);

      const section = sectionRefs.current[id];

      if (section && scrollableContainer) {
        const { top: containerTop } = scrollableContainer.getBoundingClientRect();
        const { top: sectionTop } = section.getBoundingClientRect();
        const relativeTop = sectionTop - containerTop;

        const targetOffset = scrollableContainer.scrollTop + relativeTop - offset;

        // Scroll the body to the target section.
        scrollableContainer.scrollTo({
          behavior: 'smooth',
          top: targetOffset,
        });

        // Reset isTransitioning once smooth scrolling has completed.
        let interval = setInterval(() => {
          if (scrollableContainer.scrollTop === targetOffset) {
            clearInterval(interval);
            setIsTransitioning(false);
          }
        });
      }
    },
    [offset, scrollableContainer]
  );

  // Detect active section on scroll.
  useEffect(() => {
    const detectActiveSection = () => {
      let closestId;
      let closestDimension;
      
      const { top: containerTop } = scrollableContainer.getBoundingClientRect();

      for (const [id, section] of Object.entries(sectionRefs.current)) {
        const { top: sectionTop } = section.getBoundingClientRect();
        const relativeTop = sectionTop - containerTop;

        if (!closestDimension || (relativeTop <= offset && relativeTop > closestDimension)) {
          closestDimension = sectionTop;
          closestId = id;
        }
      }

      setActive(closestId);
    };

    detectActiveSection();
    scrollableContainer.addEventListener('scroll', detectActiveSection);

    return () => {
      scrollableContainer.removeEventListener('scroll', detectActiveSection);
    };
  }, [scrollableContainer, offset]);

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
