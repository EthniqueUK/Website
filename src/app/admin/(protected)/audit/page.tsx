function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
        {title}
      </h2>
      <p className="mt-3 text-sm text-[#A79C89]">This section will be implemented in {phase}.</p>
    </section>
  );
}

export default function AdminAuditPage() {
  return <ComingSoon title="Audit Trail" phase="Phase 11" />;
}
