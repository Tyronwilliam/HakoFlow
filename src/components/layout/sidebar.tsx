"use client";

import Link from "next/link";
import { Inbox, Users, Bell, BarChart3, Settings } from "lucide-react";
import { useUnreadCount } from "../../hooks/use-unread-count";
import { Badge } from "../base/Badge";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

const links = [
  { href: "/inbox", icon: Inbox },
  { href: "/contacts", icon: Users },
  { href: "/reminders", icon: Bell },
  { href: "/stats", icon: BarChart3 },
  { href: "/settings", icon: Settings },
];

export function Sidebar() {
  const conversations = useUnreadCount();
  const route = usePathname();
  return (
    <nav className="flex flex-col gap-1 border-r p-4">
      <div className="bg-primary text-primary-foreground mb-6 flex h-9 w-9 items-center justify-center rounded-lg">
        HK
      </div>
      {links.map(({ href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "hover:bg-sidebar-accent/60 relative flex h-10 w-10 items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors",
            route === href && "text-sidebar-accent-foreground bg-sidebar-accent flex rounded-lg",
          )}
        >
          <Icon className="h-5 w-5" />
          {href === "/inbox" && (
            <Badge className="text-primary-foreground bg-primary absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full! px-1 text-[10px] font-semibold">
              {conversations.count}
            </Badge>
          )}
        </Link>
      ))}
    </nav>
  );
}
