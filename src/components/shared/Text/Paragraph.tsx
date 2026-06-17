import { cn } from "../../../lib/utils";

type ParagraphType = "light" | "regular";

interface ParagraphProps extends React.ComponentProps<"p"> {
  type: ParagraphType;
}

const variants: Record<ParagraphType, string> = {
  light: "text-foreground/80 mt-1.5 line-clamp-2 text-[13px] leading-relaxed",
  regular: "text-foreground truncate text-[14px] font-medium",
};

export const Paragraph = ({ children, type, className, ...props }: ParagraphProps) => {
  return (
    <p className={cn(variants[type], className)} {...props}>
      {children}
    </p>
  );
};
