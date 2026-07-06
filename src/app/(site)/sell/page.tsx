import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sell on Ethnique",
  description:
    "Turn your beautiful ethnic wear into cash. Join the UK's marketplace for South Asian fashion — simple listings, secure payments, and buyers who are looking for you.",
};

const whySell = [
  "Reach thousands of buyers looking specifically for South Asian fashion",
  "Sell designer and non-designer ethnic wear",
  "Secure payments",
  "Keep your item until it sells",
  "Simple listing process",
  "Dedicated customer support",
  "Sustainable fashion that gives beautiful outfits a second life",
];

const steps = [
  {
    number: 1,
    emoji: "👤",
    title: "Create Your Free Seller Account",
    body: "Sign up in just a few minutes. Create your seller profile using your email address and verify your account.",
  },
  {
    number: 2,
    emoji: "📋",
    title: "List Your Item",
    body: "Add your title, category, brand or designer, size, condition, description, price, and delivery options. Upload clear, high-quality photos from multiple angles — the better your listing, the faster it sells.",
    list: [
      "Title & category",
      "Brand or designer",
      "Size & condition",
      "Description & price",
      "Delivery options",
      "Multiple clear photos",
    ],
  },
  {
    number: 3,
    emoji: "🏦",
    title: "Set Up Your Payouts",
    body: "Connect your bank account securely to receive payment when your item sells. Your payment information is processed using trusted payment technology — Ethnique never stores your banking details directly. This is a one-time setup.",
  },
  {
    number: 4,
    emoji: "🪪",
    title: "Verify Your Identity",
    body: "To keep Ethnique safe for buyers and sellers, we may ask you to complete a quick identity verification. This helps reduce fraud, build buyer confidence, and create a trusted marketplace. Verification usually only takes a few minutes.",
  },
  {
    number: 5,
    emoji: "🔍",
    title: "Listing Review",
    body: "Before your listing goes live, our team reviews it to ensure it meets our quality standards.",
    list: [
      "Clear photographs",
      "Accurate descriptions",
      "Suitable pricing",
      "Appropriate categories",
      "Marketplace compliance",
    ],
    note: "Most listings are reviewed within 24 hours.",
  },
  {
    number: 6,
    emoji: "✨",
    title: "Your Item Goes Live",
    body: "Once approved, your item becomes visible to buyers across the UK. You'll receive notifications when someone favourites your item, a buyer contacts you, or your item sells.",
  },
  {
    number: 7,
    emoji: "📦",
    title: "Ship Your Item",
    body: "When your item sells, pack it securely, ship within the required timeframe, and upload your tracking number. We recommend trusted UK couriers such as Royal Mail, Evri, DPD, and Yodel — tracking helps protect both buyers and sellers.",
  },
  {
    number: 8,
    emoji: "💷",
    title: "Get Paid",
    body: "Once your buyer has received the item and the transaction is complete, your payment will be released to your nominated bank account. Simple. Secure. Reliable.",
  },
];

const categories = [
  { emoji: "🥻", name: "Sarees" },
  { emoji: "👰", name: "Bridal Lehengas" },
  { emoji: "💃", name: "Party Lehengas" },
  { emoji: "👗", name: "Salwar Suits" },
  { emoji: "✨", name: "Anarkalis" },
  { emoji: "🤵", name: "Sherwanis" },
  { emoji: "👔", name: "Kurtas" },
  { emoji: "🌟", name: "Indo-Western Wear" },
  { emoji: "🧒", name: "Kids' Ethnic Wear" },
  { emoji: "💎", name: "Jewellery & Accessories" },
  { emoji: "🧣", name: "Dupattas" },
  { emoji: "👚", name: "Blouses" },
  { emoji: "🎉", name: "Occasion Wear" },
  { emoji: "💐", name: "Wedding Guest Outfits" },
];

const tips = [
  { emoji: "📸", text: "Use bright, natural lighting" },
  { emoji: "📏", text: "Include accurate measurements" },
  { emoji: "📝", text: "Write detailed descriptions" },
  { emoji: "🏷️", text: "Price competitively" },
  { emoji: "💬", text: "Respond quickly to buyer questions" },
  { emoji: "🚚", text: "Dispatch promptly after a sale" },
];

const trustPoints = [
  { emoji: "✅", text: "Verified seller accounts" },
  { emoji: "🔒", text: "Secure payments" },
  { emoji: "🛡️", text: "Listing quality checks" },
  { emoji: "📍", text: "Order tracking" },
  { emoji: "🤝", text: "Buyer and seller protection" },
  { emoji: "💁", text: "Dedicated customer support" },
];

const faqs = [
  {
    q: "Is it free to list?",
    a: "Yes. Creating an account and listing your items is free. (Replace this with your actual pricing model if you charge listing fees.)",
  },
  {
    q: "How much commission does Ethnique charge?",
    a: "Ethnique only charges a selling fee when your item sells. (Insert your commission structure here.)",
  },
  {
    q: "Do I need to post my item immediately?",
    a: "No. Keep your item with you until it sells.",
  },
  {
    q: "Can I edit my listing?",
    a: "Yes. You can update your photos, description and price at any time before the item is sold.",
  },
  {
    q: "What if my item doesn't sell?",
    a: "Nothing happens — you simply keep your item listed until you're ready to remove it.",
  },
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark-section relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 40%, #C8A86A 0%, transparent 50%), radial-gradient(circle at 85% 70%, #C8A86A 0%, transparent 45%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A] mb-4">
              🛍️ Become a Seller
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#F7F3EB] leading-tight mb-6">
              Turn Your Beautiful{" "}
              <span className="text-[#C8A86A] italic">Ethnic Wear</span> Into Cash
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#A79C89] leading-relaxed mb-4 max-w-lg">
              Whether it&apos;s a designer bridal lehenga worn once, an elegant saree, a
              sherwani, or children&apos;s festive outfits — Ethnique makes it easy to sell
              to buyers who are actively looking for South Asian fashion across the UK.
            </p>
            <p className="font-sans text-sm text-[#C8A86A]/90 leading-relaxed mb-8 max-w-lg">
              ✨ No complicated setup. No endless marketplace messages. Just a simple,
              secure way to reach the right audience.
            </p>
            <Link
              href="mailto:trade@ethnique.co.uk?subject=Seller%20Registration%20Interest"
              className="inline-block bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#F7F3EB] transition-colors duration-300"
            >
              Start Selling Today →
            </Link>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="bg-[#F7F3EB]/10 backdrop-blur-sm border border-[#C8A86A]/30 p-8 sm:p-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#F7F3EB] flex items-center justify-center border-2 border-[#C8A86A]/50 shadow-2xl">
                    <Image
                      src="/Monogram.png"
                      alt="Ethnique"
                      width={160}
                      height={160}
                      className="w-[78%] h-[78%] object-contain"
                      priority
                    />
                  </div>
                </div>
                <p className="font-display text-xl text-center text-[#F7F3EB] mb-2">
                  Your Wardrobe. Their Dream Outfit.
                </p>
                <p className="font-sans text-xs text-center text-[#A79C89] tracking-wide">
                  🇬🇧 UK&apos;s marketplace for South Asian fashion
                </p>
              </div>
              <div className="absolute -bottom-3 -left-3 bg-[#C8A86A] text-[#3B0F14] font-sans text-[10px] sm:text-xs tracking-widest uppercase px-4 py-2 font-semibold">
                ♻️ Sustainable Resale
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
            💡 Why Ethnique?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#3B0F14] mt-3">
            Why Sell on Ethnique?
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {whySell.map((item) => (
            <li
              key={item}
              className="flex gap-3 items-start bg-white border border-[#C8A86A]/25 px-5 py-4 shadow-sm"
            >
              <span className="text-[#C8A86A] font-bold shrink-0">✓</span>
              <span className="font-sans text-sm text-[#3B0F14] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="bg-[#FAF0DC]/40 border-y border-[#C8A86A]/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              📖 Step by Step
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#3B0F14] mt-3">
              How Selling Works
            </h2>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <article
                key={step.number}
                className="bg-white border border-[#A79C89]/30 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shrink-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3B0F14] text-[#F7F3EB] font-display text-lg font-bold">
                    {step.number}
                  </span>
                  <span className="text-2xl" aria-hidden>
                    {step.emoji}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl sm:text-2xl text-[#3B0F14] mb-3">
                    Step {step.number} – {step.title}
                  </h3>
                  <p className="font-sans text-sm text-[#1F1F1F]/80 leading-relaxed">{step.body}</p>
                  {step.list ? (
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.list.map((item) => (
                        <li
                          key={item}
                          className="font-sans text-sm text-[#3B0F14] flex items-center gap-2"
                        >
                          <span className="text-[#C8A86A]">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {step.note ? (
                    <p className="mt-4 font-sans text-sm text-[#C8A86A] font-medium">{step.note}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What can you sell */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              👗 Categories
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#3B0F14] mt-3 mb-4">
              What Can You Sell?
            </h2>
            <p className="font-sans text-sm text-[#A79C89] leading-relaxed mb-6">
              Ethnique welcomes a wide range of South Asian fashion. Items should be clean,
              authentic and accurately described.
            </p>
            <div className="flex items-center gap-4 bg-dark-section px-6 py-5">
              <Image
                src="/Trademark.png"
                alt="Ethnique quality mark"
                width={56}
                height={56}
                className="h-14 w-auto object-contain brightness-0 invert opacity-90 shrink-0"
              />
              <p className="font-sans text-xs text-[#A79C89] leading-relaxed">
                Every listing is reviewed for quality — helping buyers shop with confidence
                and sellers stand out for the right reasons.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(({ emoji, name }) => (
              <div
                key={name}
                className="bg-white border border-[#C8A86A]/25 px-4 py-3 text-center hover:border-[#C8A86A] transition-colors"
              >
                <span className="text-2xl block mb-1" aria-hidden>
                  {emoji}
                </span>
                <span className="font-sans text-xs text-[#3B0F14] leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-dark-section py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              🚀 Pro Tips
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F7F3EB] mt-3">
              Tips for Selling Faster
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {tips.map(({ emoji, text }) => (
              <div
                key={text}
                className="flex items-center gap-4 border border-[#C8A86A]/30 bg-[#3B0F14]/50 px-5 py-4"
              >
                <span className="text-2xl shrink-0" aria-hidden>
                  {emoji}
                </span>
                <span className="font-sans text-sm text-[#F7F3EB]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
            🤝 Marketplace Trust
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#3B0F14] mt-3 mb-4">
            Why Buyers Trust Ethnique
          </h2>
          <p className="font-sans text-sm text-[#A79C89] max-w-2xl mx-auto leading-relaxed">
            Every marketplace relies on trust. That&apos;s why Ethnique helps create a safe
            buying and selling experience through:
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {trustPoints.map(({ emoji, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 bg-white border border-[#C8A86A]/25 px-5 py-4"
            >
              <span className="text-xl shrink-0" aria-hidden>
                {emoji}
              </span>
              <span className="font-sans text-sm text-[#3B0F14]">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="bg-[#FAF0DC]/40 border-t border-[#C8A86A]/20 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              ❓ FAQ
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#3B0F14] mt-3">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-white border border-[#A79C89]/30 open:border-[#C8A86A] transition-colors"
              >
                <summary className="cursor-pointer list-none font-display text-lg text-[#3B0F14] px-6 py-5 flex items-center justify-between gap-4">
                  {q}
                  <span className="text-[#C8A86A] text-sm group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <p className="font-sans text-sm text-[#A79C89] leading-relaxed px-6 pb-5 pt-0 border-t border-[#C8A86A]/10">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-section py-24 px-4 text-center">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
          🌟 Join Us
        </span>
        <h2 className="font-display text-3xl sm:text-5xl text-[#F7F3EB] mt-4 mb-6 max-w-2xl mx-auto leading-tight">
          Ready to Start Selling?
        </h2>
        <p className="font-sans text-sm text-[#A79C89] max-w-xl mx-auto leading-relaxed mb-2">
          Join the UK&apos;s growing marketplace dedicated to South Asian fashion.
        </p>
        <p className="font-sans text-sm text-[#C8A86A] max-w-xl mx-auto leading-relaxed mb-4">
          Turn wardrobes into opportunities. Give beautiful outfits a second life. ♻️
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="mailto:trade@ethnique.co.uk?subject=Seller%20Registration%20Interest"
            className="bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#F7F3EB] transition-colors duration-300"
          >
            Start Selling on Ethnique Today
          </Link>
          <Link
            href="/contact"
            className="border border-[#C8A86A]/50 text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:border-[#C8A86A] transition-colors duration-300"
          >
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  );
}
