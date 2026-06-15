import { Badge as BadgeRoot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.ComponentProps<typeof BadgeRoot> {
  content: string;
  colorDot: string;
}

export function Badge({ content, colorDot, className, ...props }: BadgeProps) {
  return (
    <BadgeRoot
      variant="secondary"
      className={cn("flex items-center gap-1.5 rounded-md text-[12px]", className)}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colorDot)}></span>
      {content}
    </BadgeRoot>
  );
}
