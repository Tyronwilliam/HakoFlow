import { Badge as BadgeRoot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps extends React.ComponentProps<typeof BadgeRoot> {
  children: ReactNode;
}

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <BadgeRoot
      variant={props.variant ?? "default"}
      className={cn("flex items-center", className)}
      {...props}
    >
      {children}
    </BadgeRoot>
  );
}
