import { ReactNode } from "react";

export const PreviewText = ({ children }: { children: ReactNode }) => {
  return (
    <p className="text-foreground/80 mt-1.5 line-clamp-2 text-[13px] leading-relaxed">{children}</p>
  );
};
