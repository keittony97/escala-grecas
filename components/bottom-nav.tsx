"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/database";

const ITEMS = [
  { path: "/escala", label: "Escala", icon: "calendar_month", adminOnly: false },
  { path: "/soldados", label: "Efetivo", icon: "shield_person", adminOnly: true },
  { path: "/afastamentos", label: "Afastam.", icon: "event_busy", adminOnly: true },
  { path: "/trocas", label: "Trocas", icon: "published_with_changes", adminOnly: true },
  { path: "/dashboard", label: "Painel", icon: "analytics", adminOnly: true },
];

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();

  const items = ITEMS.filter((item) => !item.adminOnly || role === "admin");

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-space-xs">
        {items.map((item) => {
          const active = pathname?.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors",
                active
                  ? "text-primary font-label-md"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Icon name={item.icon} className="text-[22px]" />
              <span className="font-label-sm text-label-sm uppercase mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
