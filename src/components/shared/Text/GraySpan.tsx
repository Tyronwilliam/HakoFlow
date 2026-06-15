import { ReactNode } from "react";

export const GraySpan = ({ children }: { children: ReactNode }) => {
  return <span className="text-muted-foreground/80 truncate text-[12px]">{children}</span>;
};
