import { useEffect, useRef, useState } from 'react';
import { getOffsetTop } from './utils/getOffsetTop';

export interface ActiveMenuOptions {
  activeClassName?: string;
  offset?: number;
}

export interface ActiveMenuValues {
  activeId?: string;
  registerContainer: (el: HTMLElement) => void;
  registerSection: (id: string) => (el: HTMLElement) => void;
  registerTrigger: (id: string) => (el: HTMLElement) => void;
}

export const useActiveMenu = (options: ActiveMenuOptions = {}): ActiveMenuValues => {
  const {
    activeClassName = 'active',
    offset = 0,
  } = options;
  const [activeId, setActiveId] = useState<string>();
  const containerRef = useRef<HTMLElement>();
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const triggerRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerContainer = (el: HTMLElement) => containerRef.current = el;
  const registerSection = (id: string) => (el: HTMLElement) => sectionRefs.current.set(id, el);
  const registerTrigger = (id: string) => (el: HTMLElement) => triggerRefs.current.set(id, el);

  // For each section, calculate the offset top relative to the viewport.
  // The one that is negative and closest to 0 is considered to be "active"
  // because it is the one the user just scrolled past.
  //
  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current;

    if (container && sections.size) {
      const detectClosest = () => {
        let closestTop = -Infinity;
        let closestId;
        let firstId;

        for (const [id, section] of sections.entries()) {
          const { top: containerTop } = container.getBoundingClientRect();
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
      container.addEventListener('scroll', detectClosest);

      return () => {
        container.removeEventListener('scroll', detectClosest);
      };
    }
  }, [offset]);

  // For each trigger, scroll to the section on click.
  //
  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionRefs.current;
    const triggers = triggerRefs.current;

    if (container && sections.size && triggers.size) {
      const handleClick = (id: string) => (e: globalThis.MouseEvent) => {
        e.preventDefault();
        if (!(e.target instanceof HTMLElement)) return;
        const section = sections.get(id);
        if (!section) return;

        const { top: containerTop } = container.getBoundingClientRect();
        container.scrollTo(0, getOffsetTop(section) - containerTop - offset);
      };

      for (const [id, trigger] of triggers.entries()) {
        trigger.addEventListener('click', handleClick(id));
      }

      return () => {
        for (const [id, trigger] of triggers.entries()) {
          trigger.removeEventListener('click', handleClick(id));
        }
      };
    }
  }, [offset]);

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

