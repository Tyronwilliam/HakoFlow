import { cn } from "@/lib/utils";

interface NameProps extends React.ComponentProps<"p"> {
  content: string;
}

export const Name = ({ content, className }: NameProps) => {
  return (
    <p className={cn("text-foreground truncate text-[14px] font-medium", className)}>{content}</p>
  );
};
