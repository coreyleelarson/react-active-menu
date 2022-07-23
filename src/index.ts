import { useEffect, useRef, useState } from 'react';
import { getOffsetTop } from './utils/getOffsetTop';

export interface ActiveMenuOptions {
  activeClassName?: string;
  offset?: number;
  smooth?: boolean;
}

export interface ActiveMenuValues {
  activeId?: string;
  registerContainer: (el: any) => void;
  registerSection: (id: string) => (el: any) => void;
  registerTrigger: (id: string) => (el: any) => void;
}

export const useActiveMenu = (options: ActiveMenuOptions = {}): ActiveMenuValues => {
  const {
    activeClassName = 'active',
    offset = 0,
    smooth = false,
  } = options;
  const [activeId, setActiveId] = useState<string>();
  const containerRef = useRef<any>();
  const sectionRefs = useRef<Map<string, any>>(new Map());
  const triggerRefs = useRef<Map<string, any>>(new Map());

  const registerContainer = (el: any) => containerRef.current = el;
  const registerSection = (id: string) => (el: any) => sectionRefs.current.set(id, el);
  const registerTrigger = (id: string) => (el: any) => triggerRefs.current.set(id, el);

  // For each section, calculate the offset top relative to the viewport.
  // The one that is negative and closest to 0 is considered to be "active"
  // because it is the one the user just scrolled past.
  //
  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current;

    if (sections.size) {
      const detectClosest = () => {
        let closestTop = -Infinity;
        let closestId;
        let firstId;

        for (const [id, section] of sections.entries()) {
          const { top: containerTop = 0 } = container?.getBoundingClientRect() || {};
          const { top: sectionTop } = section.getBoundingClientRect();


          if (sectionTop <= 0 + containerTop + offset && sectionTop > closestTop) {
            closestTop = sectionTop;
            closestId = id;
          }

          // Keep track of the first ID to set it by
          // default if there is currently no active ID.
          if (!firstId) firstId = id;
        }

        setActiveId(closestId || firstId);
      };

      detectClosest();

      if (container) {
        container.addEventListener('scroll', detectClosest);
        return () => {
          container.removeEventListener('scroll', detectClosest);
        };
      }

      window.addEventListener('scroll', detectClosest);
      return () => {
        window.removeEventListener('scroll', detectClosest);
      };
    }
  }, [offset]);

  // For each trigger, scroll to the section on click.
  //
  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current;
    const triggers = triggerRefs.current;

    if (sections.size && triggers.size) {
      const handleClick = (id: string) => (e: globalThis.MouseEvent) => {
        e.preventDefault();

        const section = sections.get(id);

        if (!section || !(e.target instanceof HTMLElement)) return;

        if (container) {
          const { top: containerTop } = container.getBoundingClientRect();
          container.scrollTo({
            behavior: smooth ? 'smooth' : 'auto',
            top: getOffsetTop(section) - containerTop - offset,
          });
        } else {
          window.scrollTo({
            behavior: smooth ? 'smooth' : 'auto',
            top: getOffsetTop(section) - offset,
          });
        }
      };

      let cleanupFunctions: VoidFunction[] = [];

      for (const [id, trigger] of triggers.entries()) {
        const handler = handleClick(id);
        trigger.addEventListener('click', handler);
        cleanupFunctions.push(() => trigger.removeEventListener('click', handler));
      }

      return () => {
        for (const cleanupFunction of cleanupFunctions) {
          cleanupFunction();
        }
      };
    }
  }, [offset, smooth]);

  // When the active ID changes, ensure its trigger
  // contains the "active" class.
  //
  useEffect(() => {
    const triggers = triggerRefs.current;

    if (triggers.size) {
      for (const [id, trigger] of triggers.entries()) {
        trigger.classList.remove(activeClassName);
        if (id === activeId) trigger.classList.add(activeClassName);
      }
    }
  }, [activeClassName, activeId]);

  return { activeId, registerContainer, registerSection, registerTrigger };
};

