"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/",        icon: Home,          label: "Главная" },
  { href: "/catalog", icon: Search,        label: "Каталог" },
  { href: "/cart",    icon: ShoppingCart,  label: "Корзина",  showBadge: true },
  { href: "/orders",  icon: ClipboardList, label: "Заказы" },
  { href: "/profile", icon: User,          label: "Профиль" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { getTotalItemCount } = useCartStore();
  const cartCount = getTotalItemCount();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-stretch h-[60px]">
        {NAV_ITEMS.map(({ href, icon: Icon, label, showBadge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 flex-1",
                "relative min-h-[48px] select-none",
                "transition-colors duration-150",
                active ? "text-[#5c7f5f]" : "text-text-muted"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#5c7f5f]" />
              )}

              {/* Icon with badge */}
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.3 : 1.8}
                  className={clsx(
                    "transition-all duration-150",
                    active ? "scale-110" : "scale-100"
                  )}
                />
                {showBadge && cartCount > 0 && (
                  <span
                    className={clsx(
                      "absolute -top-1.5 -right-2 bg-[#5c7f5f] text-white",
                      "text-[9px] font-bold rounded-full min-w-[16px] h-4 px-0.5",
                      "flex items-center justify-center",
                      "shadow-sm animate-badge-pop"
                    )}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  "text-[10px] leading-none font-medium transition-all duration-150",
                  active ? "opacity-100" : "opacity-60"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
