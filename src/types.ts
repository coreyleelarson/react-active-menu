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