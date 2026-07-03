"use client";

import Image from "next/image";
import { useState } from "react";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery across India is 5–7 business days. Express delivery (2–3 days) is available for select pin codes.",
  },
  {
    q: "Do you offer custom sizing?",
    a: "Yes. For select pieces we offer made-to-measure. Reach out via our contact form with your measurements and we'll guide you through the process.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for unworn items with tags intact. Custom orders are non-returnable.",
  },
  {
    q: "Do you ship internationally?",
    a: "We currently ship to India, USA, UK, UAE, Canada, and Australia. More countries coming soon.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-dark-section py-24 px-4 text-center">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
          We'd Love to Hear From You
        </span>
        <h1 className="font-display text-5xl sm:text-6xl text-[#F7F3EB] mt-4 leading-tight">
          Get in Touch
        </h1>
        <p className="font-sans text-sm text-[#A79C89] mt-6 max-w-md mx-auto leading-relaxed">
          Whether you have a question about an order, a collaboration idea, or
          just want to say hello — we're here.
        </p>
      </section>

      {/* Contact grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h2 className="font-display text-3xl text-[#3B0F14] mb-8">
            Send Us a Message
          </h2>

          {submitted ? (
            <div className="border border-[#C8A86A]/40 p-10 text-center">
              <Image
                src="/Trademark.png"
                alt=""
                width={48}
                height={48}
                className="mx-auto mb-4 opacity-60"
              />
              <h3 className="font-display text-2xl text-[#3B0F14] mb-2">
                Message Received
              </h3>
              <p className="font-sans text-sm text-[#A79C89]">
                Thank you for reaching out. We'll get back to you within 24
                hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Meera"
                    className="w-full bg-transparent border border-[#C8A86A]/30 px-4 py-3 font-sans text-sm text-[#3B0F14] placeholder:text-[#A79C89]/60 focus:outline-none focus:border-[#C8A86A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Iyer"
                    className="w-full bg-transparent border border-[#C8A86A]/30 px-4 py-3 font-sans text-sm text-[#3B0F14] placeholder:text-[#A79C89]/60 focus:outline-none focus:border-[#C8A86A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="meera@example.com"
                  className="w-full bg-transparent border border-[#C8A86A]/30 px-4 py-3 font-sans text-sm text-[#3B0F14] placeholder:text-[#A79C89]/60 focus:outline-none focus:border-[#C8A86A] transition-colors"
                />
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-2">
                  Subject
                </label>
                <select
                  required
                  className="w-full bg-[#F7F3EB] border border-[#C8A86A]/30 px-4 py-3 font-sans text-sm text-[#3B0F14] focus:outline-none focus:border-[#C8A86A] transition-colors appearance-none"
                >
                  <option value="">Select a topic</option>
                  <option>Order Enquiry</option>
                  <option>Custom Sizing</option>
                  <option>Returns & Exchanges</option>
                  <option>Wholesale & Collaboration</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-transparent border border-[#C8A86A]/30 px-4 py-3 font-sans text-sm text-[#3B0F14] placeholder:text-[#A79C89]/60 focus:outline-none focus:border-[#C8A86A] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="self-start bg-[#3B0F14] text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-10 py-4 hover:bg-[#C8A86A] hover:text-[#3B0F14] transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-10">
          <div>
            <h2 className="font-display text-3xl text-[#3B0F14] mb-8">
              Contact Details
            </h2>
            <div className="flex flex-col gap-6">
              {[
                {
                  label: "Email",
                  value: "hello@ethnique.co.uk",
                  sub: "We reply within 24 hours",
                },
                {
                  label: "Phone",
                  value: "+44 20 7946 0321",
                  sub: "Mon–Sat, 9am–6pm GMT",
                },
                {
                  label: "Address",
                  value: "London, England",
                  sub: "United Kingdom",
                },
              ].map(({ label, value, sub }) => (
                <div key={label} className="flex gap-5">
                  <div className="w-px bg-[#C8A86A] flex-shrink-0" />
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-[#A79C89] mb-0.5">
                      {label}
                    </p>
                    <p className="font-display text-lg text-[#3B0F14]">
                      {value}
                    </p>
                    <p className="font-sans text-xs text-[#A79C89]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monogram decoration */}
          <div className="bg-dark-section p-10 flex items-center gap-6">
            <Image
              src="/Monogram.png"
              alt="Ethnique"
              width={64}
              height={64}
              className="opacity-80 flex-shrink-0"
            />
            <div>
              <h3 className="font-display text-xl text-[#F7F3EB] mb-1">
                Wholesale Enquiries
              </h3>
              <p className="font-sans text-sm text-[#A79C89] leading-relaxed">
                Looking to stock Ethnique in your boutique? Write to us at{" "}
                <span className="text-[#C8A86A]">trade@ethnique.co.uk</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#A79C89]/10 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              Quick Answers
            </span>
            <h2 className="font-display text-4xl text-[#3B0F14] mt-2">
              Frequently Asked
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-[#C8A86A]/20">
            {faqs.map(({ q, a }, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left group"
                >
                  <span className="font-display text-lg text-[#3B0F14] group-hover:text-[#C8A86A] transition-colors pr-4">
                    {q}
                  </span>
                  <span className="text-[#C8A86A] font-sans text-xl flex-shrink-0">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="font-sans text-sm text-[#A79C89] leading-relaxed pb-5">
                    {a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
