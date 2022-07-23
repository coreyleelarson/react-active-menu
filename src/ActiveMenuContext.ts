import { createContext } from "react";
import type { ActiveMenuValues } from "./types";

export const ActiveMenuContext = createContext<ActiveMenuValues>({} as ActiveMenuValues);