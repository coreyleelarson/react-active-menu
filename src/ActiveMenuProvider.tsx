import type { PropsWithChildren } from "react";
import { ActiveMenuContext } from "./ActiveMenuContext";
import type { ActiveMenuValues } from "./types";

export interface ActiveMenuProviderProps {
  menu: ActiveMenuValues;
}


export const ActiveMenuProvider = ({ children, menu }: PropsWithChildren<ActiveMenuProviderProps>) => (
  <ActiveMenuContext.Provider value={menu}>
    {children}
  </ActiveMenuContext.Provider>
);