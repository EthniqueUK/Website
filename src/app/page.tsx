import Image from "next/image";
import Link from "next/link";

const featuredCategories = [
  { name: "Sarees", description: "Handwoven elegance", tag: "New Arrivals" },
  { name: "Lehengas", description: "Bridal & festive", tag: "Bestseller" },
  { name: "Kurta Sets", description: "Everyday heritage", tag: "New Arrivals" },
  { name: "Anarkalis", description: "Timeless silhouettes", tag: "Trending" },
  { name: "Dupattas", description: "Artisan embroidery", tag: "Curated" },
  { name: "Blouses", description: "Bespoke craftsmanship", tag: "Custom" },
];

const newArrivals = [
  { name: "Banarasi Silk Saree", price: "£125", color: "#8B6354" },
  { name: "Chanderi Lehenga", price: "£280", color: "#6B7C6A" },
  { name: "Ajrakh Kurta Set", price: "£68", color: "#3B5473" },
  { name: "Kanjivaram Saree", price: "£350", color: "#7D4E57" },
  { name: "Mirror Work Dupatta", price: "£32", color: "#8B7355" },
  { name: "Phulkari Kurti", price: "£45", color: "#5A6B4E" },
];

const testimonials = [
  {
    quote:
      "The Banarasi saree I ordered was beyond beautiful. The craftsmanship is extraordinary — I wore it to my daughter's wedding and received endless compliments.",
    author: "Priya Menon",
    location: "London",
  },
  {
    quote:
      "Ethnique truly understands the balance between tradition and modernity. My lehenga fit perfectly and the fabric quality is unmatched.",
    author: "Ananya Sharma",
    location: "Birmingham",
  },
  {
    quote:
      "I've been buying ethnic wear for years, but Ethnique's curation is at a different level. Every piece tells a story.",
    author: "Ritu Kapoor",
    location: "Leicester",
  },
];

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Hero */}
      <section className="bg-dark-section relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, #C8A86A 0%, transparent 55%), radial-gradient(circle at 80% 30%, #C8A86A 0%, transparent 40%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgc3Ryb2tlPSIjQzhBODZBIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A] mb-6">
              New Collection {currentYear}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#F7F3EB] leading-tight mb-6">
              Where Tradition
              <br />
              <span className="text-[#C8A86A] italic">Meets Grace</span>
            </h1>
            <p className="font-sans text-base text-[#A79C89] leading-relaxed mb-10 max-w-md">
              Discover handcrafted Indian ethnic wear — each piece woven with
              centuries of artistry, designed for the woman who walks between
              worlds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/collections"
                className="bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#F7F3EB] transition-colors duration-300"
              >
                Explore Collection
              </Link>
              <Link
                href="/about"
                className="border border-[#C8A86A]/50 text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:border-[#C8A86A] transition-colors duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>

          {/* Hero visual — Monogram */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Outer decorative ring */}
              <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-[#C8A86A]/40 flex items-center justify-center">
                {/* Mid ring */}
                <div className="w-64 h-64 sm:w-[22rem] sm:h-[22rem] rounded-full border border-[#C8A86A]/25 flex items-center justify-center">
                  {/* Ivory disc — gives the dark monogram a contrasting ground */}
                  <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-[#F7F3EB] flex items-center justify-center shadow-2xl">
                    <Image
                      src="/Monogram.png"
                      alt="Ethnique Monogram"
                      width={220}
                      height={220}
                      className="w-44 h-44 sm:w-60 sm:h-60 object-contain"
                    />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-wider uppercase px-4 py-2">
                Est. 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <section className="bg-[#C8A86A] py-3 overflow-hidden">
        <div className="flex animate-none whitespace-nowrap">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#3B0F14] px-8">
            Handcrafted Sarees &nbsp;✦&nbsp; Bridal Lehengas &nbsp;✦&nbsp;
            Artisan Kurtas &nbsp;✦&nbsp; Festive Anarkalis &nbsp;✦&nbsp;
            Heritage Textiles &nbsp;✦&nbsp; Free UK Shipping Above £75
            &nbsp;✦&nbsp; Handcrafted Sarees &nbsp;✦&nbsp; Bridal Lehengas
            &nbsp;✦&nbsp; Artisan Kurtas &nbsp;✦&nbsp; Festive Anarkalis
            &nbsp;✦&nbsp; Heritage Textiles &nbsp;✦&nbsp; Free UK Shipping Above
            £75
          </p>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
            Discover
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-[#3B0F14] mt-2">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.name}
              href="/collections"
              className="group relative overflow-hidden"
            >
              {/* Placeholder card */}
              <div className="bg-dark-section aspect-[3/4] flex flex-col items-center justify-end p-4">
                {/* Decorative mandala-like element */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="w-24 h-24 rounded-full border-2 border-[#C8A86A]" />
                  <div className="absolute w-16 h-16 rounded-full border border-[#C8A86A]" />
                  <div className="absolute w-8 h-8 rounded-full border border-[#C8A86A]" />
                </div>

                <span className="relative z-10 font-sans text-[10px] tracking-widest uppercase text-[#C8A86A] mb-1">
                  {cat.tag}
                </span>
                <h3 className="relative z-10 font-display text-lg text-[#F7F3EB] text-center leading-tight">
                  {cat.name}
                </h3>
                <p className="relative z-10 font-sans text-xs text-[#A79C89] mt-1">
                  {cat.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-[#C8A86A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals horizontal scroll */}
      <section className="py-20 bg-[#7A2030]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
                Just In
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#3B0F14] mt-2">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/collections"
              className="font-sans text-xs tracking-widest uppercase text-[#3B0F14] border-b border-[#3B0F14] pb-0.5 hover:text-[#C8A86A] hover:border-[#C8A86A] transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-5 px-4 sm:px-6 lg:px-8 pb-4" style={{ width: "max-content" }}>
            {newArrivals.map((product, i) => (
              <div
                key={i}
                className="group flex-shrink-0 w-56 sm:w-64 cursor-pointer"
              >
                {/* Product image placeholder */}
                <div
                  className="w-full aspect-[3/4] relative overflow-hidden mb-3"
                  style={{ backgroundColor: product.color }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/Trademark.png"
                      alt={product.name}
                      width={80}
                      height={80}
                      className="opacity-20 w-16 h-16 object-contain"
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[#7A2030]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href="/collections"
                      className="bg-[#F7F3EB] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-5 py-2.5"
                    >
                      Quick View
                    </Link>
                  </div>
                  <div className="absolute top-3 left-3 bg-[#C8A86A] text-[#3B0F14] font-sans text-[10px] tracking-wider uppercase px-2 py-0.5">
                    New
                  </div>
                </div>
                <h3 className="font-display text-base text-[#3B0F14]">
                  {product.name}
                </h3>
                <p className="font-sans text-sm text-[#A79C89] mt-0.5">
                  {product.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand values strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            {
              icon: "✦",
              title: "Artisan Crafted",
              body: "Every piece is made by skilled karigars preserving generations of craft.",
            },
            {
              icon: "✦",
              title: "Ethically Sourced",
              body: "We partner directly with weavers across India for fair and transparent trade.",
            },
            {
              icon: "✦",
              title: "Heirloom Quality",
              body: "Fabrics and finishes chosen to last — pieces you'll pass down with pride.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col items-center">
              <span className="text-[#C8A86A] text-2xl mb-4">{icon}</span>
              <h3 className="font-display text-xl text-[#3B0F14] mb-2">
                {title}
              </h3>
              <p className="font-sans text-sm text-[#A79C89] leading-relaxed max-w-xs">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-width banner */}
      <section className="bg-dark-section py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Image
            src="/Trademark.png"
            alt="Ethnique Trademark"
            width={60}
            height={60}
            className="mx-auto mb-8 opacity-60"
          />
          <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3EB] mb-6 leading-tight">
            Dressed in Heritage,
            <br />
            <span className="text-[#C8A86A] italic">Styled for Today</span>
          </h2>
          <p className="font-sans text-sm text-[#A79C89] mb-10 leading-relaxed max-w-xl mx-auto">
            Our bridal and festive collections marry the poetry of Indian
            textiles with silhouettes built for the modern woman. Explore looks
            for every occasion.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-10 py-4 hover:bg-[#F7F3EB] transition-colors duration-300"
          >
            Explore Festive Edit
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
            Voices
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-[#3B0F14] mt-2">
            What Our Patrons Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="border border-[#C8A86A]/30 p-8 flex flex-col"
            >
              <span className="text-[#C8A86A] font-display text-4xl leading-none mb-4">
                "
              </span>
              <p className="font-sans text-sm text-[#A79C89] leading-relaxed flex-1">
                {t.quote}
              </p>
              <div className="mt-6 pt-6 border-t border-[#C8A86A]/20">
                <p className="font-display text-base text-[#3B0F14]">
                  {t.author}
                </p>
                <p className="font-sans text-xs text-[#A79C89] tracking-wider uppercase mt-0.5">
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#A79C89]/20 py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-3xl text-[#3B0F14] mb-3">
            Join the Ethnique Circle
          </h2>
          <p className="font-sans text-sm text-[#A79C89] mb-8">
            Be the first to know about new arrivals, exclusive drops, and
            stories from our artisans.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-[#F7F3EB] border border-[#C8A86A]/40 px-5 py-3 font-sans text-sm text-[#3B0F14] placeholder:text-[#A79C89] focus:outline-none focus:border-[#C8A86A]"
            />
            <button
              type="submit"
              className="bg-[#3B0F14] text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-7 py-3 hover:bg-[#C8A86A] hover:text-[#3B0F14] transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
