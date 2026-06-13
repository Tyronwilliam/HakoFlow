import Link from "next/link";
import { Inbox, Users, Bell, BarChart3, Settings } from "lucide-react";

const links = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <nav className="flex w-56 flex-col gap-1 border-r p-4">
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="flex items-center gap-2 rounded-md p-2 text-sm">
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
