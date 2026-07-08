"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAdmin } from "../actions";
import type { StaffAuthState } from "@/lib/auth/admin";
import { roleLabel } from "@/lib/auth/permissions";

import { AdminIcon } from "./admin-icons";

type AdminHeaderProps = {
  staff: StaffAuthState;
};

export function AdminHeader({ staff }: AdminHeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin";

  return (
    <header className="sticky top-0 z-40 rounded-2xl border border-[#A79C89]/40 bg-white shadow-sm sm:static">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Image
            src="/Monogram.png"
            alt="Ethnique"
            width={80}
            height={80}
            className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
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
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {!isDashboard ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-[#A79C89]/40 bg-[#F7F3EB] px-3 py-2 text-xs font-semibold text-[#3B0F14] transition hover:border-[#C8A86A] sm:text-sm"
            >
              <AdminIcon name="grid" className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          ) : null}

          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-xl bg-[#3B0F14] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5C1520] sm:px-4 sm:text-sm"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
