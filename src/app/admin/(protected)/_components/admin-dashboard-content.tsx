import Link from "next/link";

import type { AdminGroup } from "@/lib/auth/permissions";

import { AdminIcon } from "./admin-icons";

type AdminDashboardContentProps = {
  roleLabel: string;
  marketCode: string | null;
  displayName: string | null;
  email: string;
  groups: AdminGroup[];
};

export function AdminDashboardContent({
  roleLabel,
  marketCode,
  displayName,
  email,
  groups,
}: AdminDashboardContentProps) {
  const greetingName = displayName?.trim().split(/\s+/)[0] || email || "there";
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A86A]">
          {roleLabel}
          {marketCode ? ` · ${marketCode.toUpperCase()} market` : " · All markets"}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14] sm:text-3xl">
          Welcome back, {greetingName}
        </h2>
        <p className="mt-2 text-sm text-[#A79C89]">Choose a section to get started.</p>
      </section>

      {/* Group launcher */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.key}
            className="flex flex-col rounded-2xl border border-[#A79C89]/40 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-4">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: group.accent }}
              >
                <AdminIcon name={group.icon} className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#3B0F14]">
                  {group.label}
                </h3>
                <p className="truncate text-xs text-[#A79C89]">{group.description}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="group flex items-center gap-3 rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB]/60 px-4 py-3 transition hover:border-[#C8A86A] hover:bg-white hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#3B0F14] transition group-hover:bg-[#3B0F14] group-hover:text-[#C8A86A]">
                    <AdminIcon name={tab.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#3B0F14]">
                      {tab.label}
                    </span>
                    <span className="block truncate text-xs text-[#A79C89]">
                      {tab.description}
                    </span>
                  </span>
                  <AdminIcon
                    name="arrow"
                    className="h-4 w-4 shrink-0 text-[#A79C89] transition group-hover:translate-x-0.5 group-hover:text-[#C8A86A]"
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
