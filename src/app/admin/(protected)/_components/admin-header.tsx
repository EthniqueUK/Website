"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAdmin } from "../actions";
import type { StaffAuthState } from "@/lib/auth/admin";
import { getNavItemsForStaff, roleLabel } from "@/lib/auth/permissions";

type AdminHeaderProps = {
  staff: StaffAuthState;
};

function isNavActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader({ staff }: AdminHeaderProps) {
  const pathname = usePathname();
  const navItems = getNavItemsForStaff(staff);

  return (
    <header className="sticky top-0 z-40 overflow-hidden rounded-2xl border border-[#A79C89]/40 bg-white shadow-sm sm:static">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <Image
            src="/Monogram.png"
            alt="Ethnique"
            width={80}
            height={80}
            className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
            priority
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C8A86A] sm:text-xs">
              Admin Portal
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] truncate text-lg font-bold text-[#3B0F14] sm:text-2xl">
              Dashboard
            </h1>
            <p className="truncate text-xs text-[#A79C89]">
              {roleLabel(staff.role)}
              {staff.marketCode ? ` · ${staff.marketCode.toUpperCase()}` : " · All markets"}
            </p>
          </div>
        </div>

        <form action={signOutAdmin} className="shrink-0">
          <button
            type="submit"
            className="rounded-xl bg-[#3B0F14] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5C1520] sm:px-4 sm:text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      <nav
        className="flex flex-nowrap gap-2 overflow-x-auto border-t border-[#A79C89]/20 px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
        aria-label="Admin navigation"
      >
        {navItems.map((item) => {
          const active = isNavActive(item.href, pathname, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition sm:px-4 ${
                active
                  ? "bg-[#3B0F14] text-white shadow-sm"
                  : "border border-[#A79C89]/40 bg-[#F7F3EB] text-[#3B0F14] hover:border-[#C8A86A]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
