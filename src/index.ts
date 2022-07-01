import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface UseScrollMenuOptions {
  offset?: number;
  onActiveChange?: (attributes: ScrollMenuAttributes) => void;
}

export interface ScrollMenuAttributes {
  active?: string;
  isTransitioning: boolean;
  sectionRefs: Record<string, HTMLElement>;
  triggerRefs: Record<string, HTMLElement>;
}

export interface ScrollMenu {
  active?: string;
  handleTriggerClick: (id: string) => (e: MouseEvent) => void;
  registerSectionRef: (id: string) => (ref: HTMLElement) => void;
  registerTriggerRef: (id: string) => (ref: HTMLElement) => void;
}

export const useScrollMenu = (options: UseScrollMenuOptions = {}): ScrollMenu => {
  const { offset = 0, onActiveChange } = options;
  const [active, setActive] = useState<string>();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  const triggerRefs = useRef<Record<string, HTMLElement>>({});

  const registerSectionRef = useCallback((id: string) => (ref: HTMLElement) => (sectionRefs.current[id] = ref), []);
  const registerTriggerRef = useCallback((id: string) => (ref: HTMLElement) => (triggerRefs.current[id] = ref), []);
  const handleTriggerClick = useCallback(
    (id: string) => (e: MouseEvent) => {
      e.preventDefault();
      setIsTransitioning(true);

      const section = sectionRefs.current[id];

      if (section) {
        const targetOffset = document.body.scrollTop + section.getBoundingClientRect().top - offset;

        // Scroll the body to the target section.
        document.body.scrollTo({
          behavior: 'smooth',
          top: targetOffset,
        });

        // Reset isTransitioning once smooth scrolling has completed.
        let interval = setInterval(() => {
          if (document.body.scrollTop === targetOffset) {
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

    document.body.addEventListener('scroll', detectActiveSection);

    return () => {
      document.body.removeEventListener('scroll', detectActiveSection);
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
