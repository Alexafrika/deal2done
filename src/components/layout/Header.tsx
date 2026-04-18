"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const BACK_BUTTON_PATHS = ["/login", "/register", "/kyc", "/cart", "/orders", "/profile"];

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const showBack = BACK_BUTTON_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/catalog");
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#ebebeb]">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-extrabold text-[20px] tracking-tight select-none">
          <span className="text-[#5c7f5f]">Deal</span>
          <span className="text-text-primary">2Done</span>
        </Link>

        {/* Right nav */}
        <nav className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Назад"
              className="flex items-center gap-1 text-[13px] font-semibold text-text-secondary
                px-3 py-1.5 rounded-xl hover:bg-surface-secondary transition-colors"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
              Назад
            </button>
          )}
          <Link
            href="/catalog"
            className="text-[13px] font-semibold text-text-secondary
              px-3 py-1.5 rounded-xl hover:bg-surface-secondary transition-colors"
          >
            Каталог
          </Link>
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="text-[13px] font-bold text-white bg-[#5c7f5f]
                px-3 py-1.5 rounded-xl hover:bg-[#4a6e4d] transition-colors"
            >
              Профиль
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[13px] font-bold text-white bg-[#5c7f5f]
                px-3 py-1.5 rounded-xl hover:bg-[#4a6e4d] transition-colors"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
