import { MouseEvent, useEffect, useState } from 'react';

export interface ActiveMenuOptions {
  activeClassName?: string;
  offset?: number;
}

export interface ActiveMenuValues {
  activeId?: string;
}

export const useActiveMenu = (options: ActiveMenuOptions = {}): ActiveMenuValues => {
  const { activeClassName = 'active', offset = 0 } = options;
  const [activeId, setActiveId] = useState<string>();

  // For each section, calculate the offset top relative to the viewport.
  // The one that is negative and closest to 0 is considered to be "active"
  // because it is the one the user just scrolled past.
  //
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-am-section]');

    const detectClosest = () => {
      let closestTop = -Infinity;
      let closestId;
      let firstId;

      for (const section of sections) {
        const id = section.dataset.amSection;
        const { top } = section.getBoundingClientRect();

        if (top <= 0 + offset && top > closestTop) {
          closestTop = top;
          closestId = id;
        }

        // Keep track of the first ID to set it by
        // default if there is currently no active ID.
        if (!firstId) firstId = id;
      }

      setActiveId(closestId || firstId);
    };

    detectClosest();
    document.body.addEventListener('scroll', detectClosest);

    return () => {
      document.body.removeEventListener('scroll', detectClosest);
    };
  }, [offset]);

  // For each trigger, scroll to the section on click.
  //
  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLElement>('[data-am-trigger]');

    const handleClick = (e: globalThis.MouseEvent) => {
      e.preventDefault();
      if (!(e.target instanceof HTMLElement)) return;
      const id = e.target.dataset.amTrigger;
      const section = document.querySelector<HTMLElement>(`[data-am-section="${id}"]`);
      document.body.scrollTo(0, getOffsetTop(section) - offset);
    };

    for (const trigger of triggers) {
      trigger.addEventListener('click', handleClick);
    }

    return () => {
      for (const trigger of triggers) {
        trigger.removeEventListener('click', handleClick);
      }
    };
  }, [offset]);

  // When the active ID changes, ensure its trigger
  // contains the "active" class.
  //
  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLElement>('[data-am-trigger]');

    for (const trigger of triggers) {
      trigger.classList.remove(activeClassName);
      if (trigger.dataset.amTrigger === activeId) trigger.classList.add(activeClassName);
    }
  }, [activeClassName, activeId]);

  return { activeId };
};

