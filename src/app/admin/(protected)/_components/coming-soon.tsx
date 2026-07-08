import Link from "next/link";

import { AdminIcon, type AdminIconKey } from "./admin-icons";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: AdminIconKey;
  phase?: string;
};

export function ComingSoon({
  title,
  description,
  icon = "grid",
  phase,
}: ComingSoonProps) {
  return (
    <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-8 shadow-sm sm:p-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3B0F14] text-[#C8A86A]">
          <AdminIcon name={icon} className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-[#A79C89]">{description}</p>
        ) : null}
        {phase ? (
          <span className="mt-5 rounded-full border border-[#C8A86A]/40 bg-[#FAF0DC]/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#9A7B4F]">
            {phase}
          </span>
        ) : null}
        <Link
          href="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#A79C89]/40 bg-[#F7F3EB] px-5 py-2.5 text-sm font-medium text-[#3B0F14] transition hover:border-[#C8A86A]"
        >
          <AdminIcon name="arrow" className="h-4 w-4 rotate-180" />
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}
