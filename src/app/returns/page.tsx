import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Cancellations Policy — Ethnique",
  description:
    "Ethnique returns, cancellations, and dispute policy for buyers and sellers on our ethnic wear marketplace.",
};

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-2xl sm:text-3xl text-[#3B0F14] mb-5 pb-3 border-b border-[#C8A86A]/30">
        {title}
      </h2>
      <div className="space-y-4 font-sans text-sm text-[#1F1F1F] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-[#3B0F14] mt-6 mb-2">
      {children}
    </h3>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-[#C8A86A]">
      {items.map((item) => (
        <li key={item} className="text-[#1F1F1F]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "highlight";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-[#C8A86A]/40 bg-[#C8A86A]/10",
    warning: "border-[#7A2030]/30 bg-[#7A2030]/8",
    highlight: "border-[#3B0F14]/20 bg-[#F7F3EB]",
  };

  return (
    <div className={`border-l-4 px-5 py-4 ${styles[variant]}`}>
      {title && (
        <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#3B0F14] mb-2 font-medium">
          {title}
        </p>
      )}
      <div className="font-sans text-sm text-[#1F1F1F] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

const tableOfContents = [
  { id: "legal-notice", label: "Important Legal Notice" },
  { id: "marketplace-role", label: "Marketplace Role" },
  { id: "returns-policy", label: "Returns Policy" },
  { id: "statutory-rights", label: "Statutory Rights" },
  { id: "cooling-off", label: "14-Day Cooling-Off Period" },
  { id: "misrepresentation", label: "Item Misrepresentation" },
  { id: "return-process", label: "Return Process" },
  { id: "cancellations", label: "Cancellations Policy" },
  { id: "customs", label: "Customs Duties" },
  { id: "rentals", label: "Rentals Cancellations" },
  { id: "refunds", label: "Refunds" },
  { id: "shipping-costs", label: "Shipping Costs" },
  { id: "limitations", label: "Limitations & Disclaimers" },
  { id: "purchase-protection", label: "Purchase Protection" },
  { id: "contact", label: "Contact" },
];

export default function ReturnsPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark-section py-20 px-4 text-center">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
          Policy
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#F7F3EB] mt-4 leading-tight max-w-3xl mx-auto">
          Returns &amp; Cancellations
        </h1>
        <p className="font-sans text-sm text-[#A79C89] mt-6 max-w-2xl mx-auto leading-relaxed">
          Your rights and obligations when buying, returning, or cancelling on
          the Ethnique marketplace.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 lg:gap-16">
          {/* Table of contents — desktop sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28">
              <p className="font-sans text-xs tracking-[0.2em] uppercase text-[#C8A86A] mb-4">
                On this page
              </p>
              <ul className="space-y-2 border-l border-[#C8A86A]/20 pl-4">
                {tableOfContents.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="font-sans text-xs text-[#A79C89] hover:text-[#3B0F14] transition-colors leading-snug block py-0.5"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Policy body */}
          <article className="max-w-3xl space-y-12">
            <div className="space-y-4">
              <h2 className="font-display text-3xl text-[#3B0F14]">
                Ethnique Returns and Cancellations Policy
              </h2>
              <p className="font-sans text-sm text-[#1F1F1F] leading-relaxed">
                At Ethnique, we aim to provide a secure and transparent
                marketplace connecting buyers and sellers of ethnic wear. This
                policy outlines your rights and obligations regarding returns,
                cancellations, and disputes. These terms apply to sales
                transactions, with a separate section for rentals.
              </p>
            </div>

            <PolicySection id="legal-notice" title="Important Legal Notice (UK Customers)">
              <p>
                For buyers in the United Kingdom, your rights may be protected
                under:
              </p>
              <PolicyList
                items={[
                  "Consumer Rights Act 2015",
                  "Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013",
                ]}
              />
              <p>Nothing in this policy removes or limits your statutory rights.</p>
              <Callout variant="highlight" title="Key takeaway">
                If you are buying from a business seller, you may have
                additional legal rights beyond this policy.
              </Callout>
            </PolicySection>

            <PolicySection id="marketplace-role" title="Marketplace Role of Ethnique">
              <p>
                Ethnique operates as an online marketplace platform that
                facilitates transactions between buyers and independent sellers.
              </p>
              <PolicyList
                items={[
                  "Ethnique is not the seller of record for most listings",
                ]}
              />
              <SubHeading>The seller is responsible for</SubHeading>
              <PolicyList
                items={[
                  "Product quality",
                  "Accuracy of listings",
                  "Fulfilment and delivery",
                ]}
              />
              <p>
                Ethnique may intervene in disputes under its Purchase Protection
                policy, but is not a party to the contract between buyer and
                seller.
              </p>
            </PolicySection>

            <PolicySection id="returns-policy" title="Returns Policy (Sales Only)">
              <p>Sellers may choose one of the following return options:</p>

              <SubHeading>A. Final Sale – No Returns/Exchanges</SubHeading>
              <PolicyList
                items={[
                  "Items marked as Final Sale cannot be returned or exchanged",
                  "Exception: Where required by law (e.g., faulty or misrepresented goods)",
                ]}
              />

              <SubHeading>B. Returns/Exchanges Accepted</SubHeading>
              <p>If a seller allows returns:</p>
              <PolicyList
                items={[
                  "Buyers must follow the return conditions in the listing",
                  "Returns must comply with UK consumer law where applicable",
                ]}
              />
            </PolicySection>

            <PolicySection id="statutory-rights" title="Statutory Rights (UK Law)">
              <p>
                If you are purchasing from a business seller, you have the right
                to:
              </p>
              <PolicyList
                items={[
                  "Reject faulty or misdescribed goods within 30 days for a full refund",
                  "Request repair/replacement after 30 days",
                  "Receive goods that are as described, of satisfactory quality, and fit for purpose",
                ]}
              />
              <p>
                These rights apply regardless of the seller&apos;s stated return
                policy.
              </p>
            </PolicySection>

            <PolicySection id="cooling-off" title="14-Day Cooling-Off Period (Distance Selling Rules)">
              <p>
                Under UK law, when buying from a business seller online, you may
                have the right to:
              </p>
              <PolicyList
                items={[
                  "Cancel your order within 14 days of delivery",
                  "Receive a full refund, including standard delivery costs",
                ]}
              />
              <SubHeading>Exceptions may apply for</SubHeading>
              <PolicyList
                items={[
                  "Custom-made or personalised items",
                  "Sealed items (if opened and not suitable for return)",
                  "Items clearly marked as exempt under law",
                ]}
              />
              <SubHeading>Buyers must</SubHeading>
              <PolicyList
                items={[
                  "Return items within 14 days of cancellation",
                  "Keep items in reasonable condition",
                ]}
              />
              <p>
                Return postage costs may be the buyer&apos;s responsibility unless
                otherwise stated.
              </p>
            </PolicySection>

            <PolicySection id="misrepresentation" title="Item Misrepresentation">
              <p>An item may be eligible for return/refund if:</p>
              <PolicyList
                items={[
                  "Undisclosed damage or defects",
                  "Incorrect or missing items",
                  "Item significantly differs from description",
                  "Counterfeit or inauthentic goods",
                ]}
              />
              <SubHeading>Process</SubHeading>
              <ol className="space-y-2 pl-5 list-decimal marker:text-[#C8A86A]">
                <li>Contact seller via Ethnique messaging</li>
                <li>
                  If unresolved, contact{" "}
                  <a
                    href="mailto:hello@ethnique.com"
                    className="text-[#3B0F14] underline underline-offset-2 hover:text-[#C8A86A] transition-colors"
                  >
                    hello@ethnique.com
                  </a>
                </li>
                <li>Provide evidence (photos, description)</li>
              </ol>
              <SubHeading>Ethnique may</SubHeading>
              <PolicyList
                items={[
                  "Approve returns",
                  "Issue refunds",
                  "Take action against sellers",
                ]}
              />
            </PolicySection>

            <PolicySection id="return-process" title="Return Process">
              <ol className="space-y-3 pl-5 list-decimal marker:text-[#C8A86A] marker:font-medium">
                <li>Contact seller via Ethnique platform</li>
                <li>
                  Escalate to Ethnique Support (
                  <a
                    href="mailto:hello@ethnique.com"
                    className="text-[#3B0F14] underline underline-offset-2 hover:text-[#C8A86A] transition-colors"
                  >
                    hello@ethnique.com
                  </a>
                  )
                </li>
                <li>Return approval issued if eligible</li>
                <li>Ship item within 5 days of approval</li>
                <li>Provide tracking details</li>
                <li>Refund issued after verification</li>
              </ol>
              <Callout variant="warning" title="Important">
                Disputes must be raised within 3 days (platform protection) or
                longer where required under UK law.
              </Callout>
            </PolicySection>

            <PolicySection id="cancellations" title="Cancellations Policy">
              <SubHeading>Sales Cancellations</SubHeading>
              <PolicyList
                items={[
                  "Orders can be cancelled before dispatch",
                  "After dispatch → follow returns process",
                ]}
              />
              <SubHeading>Fees</SubHeading>
              <p>
                Payment processing and platform fees are non-refundable, unless
                required by law.
              </p>

              <SubHeading>Change-of-Mind Cancellations</SubHeading>
              <p>Includes:</p>
              <PolicyList
                items={[
                  "No longer needed",
                  "Customs charges",
                  "Personal preference",
                ]}
              />
              <SubHeading>Rules</SubHeading>
              <PolicyList
                items={[
                  "Before dispatch → refund minus fees",
                  "After dispatch → return process applies",
                ]}
              />
            </PolicySection>

            <PolicySection id="customs" title="Customs Duties and Import Fees">
              <p>For international purchases, buyers are responsible for:</p>
              <PolicyList
                items={[
                  "Import VAT",
                  "Customs duties",
                  "Clearance fees",
                ]}
              />
              <p>
                These are set by authorities and outside Ethnique&apos;s control.
              </p>
              <p>
                Refusal to accept delivery due to customs charges may result in
                return costs deducted from refund.
              </p>
            </PolicySection>

            <PolicySection id="rentals" title="Rentals Cancellations">
              <PolicyList
                items={[
                  "Cancel up to 72 hours before start → full refund",
                  "Within 72 hours → non-refundable",
                  "Subject to individual provider terms",
                ]}
              />
            </PolicySection>

            <PolicySection id="refunds" title="Refunds">
              <PolicyList
                items={[
                  "Issued to original payment method",
                  "Processed after item verification",
                  "Platform/service fees are non-refundable unless legally required",
                ]}
              />
            </PolicySection>

            <PolicySection id="shipping-costs" title="Shipping Costs">
              <PolicyList
                items={[
                  "Misrepresentation → seller covers return shipping",
                  "Change-of-mind → buyer pays return shipping",
                  "Legal rights may override this",
                ]}
              />
            </PolicySection>

            <PolicySection id="limitations" title="Limitations and Disclaimers">
              <PolicyList
                items={[
                  "Ethnique does not guarantee seller listings accuracy",
                  "Not liable for transactions outside platform",
                  "Acts as mediator, not principal seller",
                ]}
              />
            </PolicySection>

            <PolicySection id="purchase-protection" title="Ethnique Purchase Protection">
              <p>Ethnique offers Purchase Protection to:</p>
              <PolicyList
                items={[
                  "Support dispute resolution",
                  "Provide refunds in qualifying cases",
                  "Maintain marketplace trust",
                ]}
              />
            </PolicySection>

            <PolicySection id="contact" title="Contact">
              <p>For support, contact:</p>
              <p className="mt-2">
                <a
                  href="mailto:hello@ethnique.com"
                  className="inline-flex items-center gap-2 font-sans text-base text-[#3B0F14] underline underline-offset-4 hover:text-[#C8A86A] transition-colors"
                >
                  hello@ethnique.com
                </a>
              </p>
              <p className="text-[#A79C89] mt-4">
                You can also visit our{" "}
                <Link
                  href="/contact"
                  className="text-[#3B0F14] underline underline-offset-2 hover:text-[#C8A86A] transition-colors"
                >
                  contact page
                </Link>{" "}
                for general enquiries.
              </p>
            </PolicySection>

            <p className="font-sans text-xs text-[#A79C89] pt-8 border-t border-[#C8A86A]/20">
              Last updated: {new Date().getFullYear()}. Ethnique reserves the
              right to update this policy. Your statutory rights are unaffected.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
