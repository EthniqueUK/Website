import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Seller and marketplace terms for Ethnique.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">Legal</p>
      <h1 className="font-display text-4xl text-[#3B0F14] mt-3">Terms and Conditions</h1>
      <div className="mt-8 space-y-5 font-sans text-sm leading-7 text-[#1F1F1F]/80">
        <p>
          By submitting a seller onboarding form, you confirm that the information and documents
          you provide are accurate, lawful, and yours to share.
        </p>
        <p>
          Ethnique may verify identity and address documentation before granting marketplace access.
          Approval is at Ethnique&apos;s discretion and may be withdrawn if policies are breached.
        </p>
        <p>
          Sellers are responsible for item authenticity, accurate listings, secure packaging, and
          timely dispatch. Buyers and sellers must comply with UK consumer protection and fire safety
          requirements where applicable.
        </p>
        <p>
          This placeholder page will be replaced with the full legal Terms and Conditions once
          counsel review is complete.
        </p>
      </div>
      <Link
        href="/sell"
        className="inline-block mt-10 border border-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#C8A86A]/10"
      >
        Back to Sell with Us
      </Link>
    </div>
  );
}
