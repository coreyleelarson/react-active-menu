import { useContext } from "react";
import { ActiveMenuContext } from "./ActiveMenuContext";

export const useActiveMenuContext = () => useContext(ActiveMenuContext);