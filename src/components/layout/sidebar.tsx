import Link from "next/link";
import { Inbox, Users, Bell, BarChart3, Settings } from "lucide-react";

const links = [
  { href: "/inbox", icon: Inbox },
  { href: "/contacts", icon: Users },
  { href: "/reminders", icon: Bell },
  { href: "/stats", icon: BarChart3 },
  { href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <nav className="flex flex-col gap-1 border-r p-4">
      <div className="bg-primary text-primary-foreground mb-6 flex h-9 w-9 items-center justify-center rounded-lg">
        HK
      </div>
      {links.map(({ href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="hover:bg-sidebar-accent/60 flex items-center gap-2 rounded-md p-2 text-sm"
        >
          <Icon className="h-5 w-5" />
        </Link>
      ))}
    </nav>
  );
}
