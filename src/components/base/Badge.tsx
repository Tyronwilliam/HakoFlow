import { Badge as BadgeRoot } from "@/components/ui/badge";

export function Badge({
  content,
  ...props
}: {
  content: string;
  className: string;
  bubbleStyle: string;
}) {
  return (
    <BadgeRoot
      variant="secondary"
      className={`${props.className} flex items-center gap-1.5 rounded-md text-[12px]`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${props.bubbleStyle}`}></span>
      {content}
    </BadgeRoot>
  );
}
