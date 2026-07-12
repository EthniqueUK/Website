import Image from "next/image";
import Link from "next/link";

const values = [
  {
    title: "Rooted in Craft",
    body: "We work with master karigars across Varanasi, Jaipur, Kutch, and Kanchipuram — preserving techniques that have been passed down for centuries.",
  },
  {
    title: "Ethical & Transparent",
    body: "Every artisan partnership is direct and fair. We pay living wages and share each weaver's story as openly as we share the fabric.",
  },
  {
    title: "Contemporary Vision",
    body: "Tradition is our foundation, not our ceiling. We design for the modern Indian woman — confident, culturally proud, globally aware.",
  },
  {
    title: "Heirloom Standard",
    body: "We refuse to compromise on quality. From hand-dyeing to finishing, every step is done with intention so you receive something worth keeping forever.",
  },
];

const team = [
  {
    name: "Ms. Sasmita Pattanaik",
    roles: ["Founder", "Creative Director", "Operations Lead"],
    bio: "With a great passion for Indian Ethnic Wears, Ms. Sasmita founded 'Ethnique' to create a bridge between skilled artisans from different parts of India and contemporary wardrobes in the UK.",
  },
  {
    name: "Mr. Sumit Mohanty",
    roles: ["Co-Founder", "Head of Policies"],
    bio: "Mr. Sumit, with his passion for advocating for ethical trade practices, Ethique's ethical policies and practices are a testament to his dedication and commitment to ensuring that our partnerships are as just as they are beautiful.",
  },
  {
    name: "Mr. Som Das",
    roles: ["Founding Member", "Head of Technologies"],
    bio: "Mr. Som, with his passion for technology and innovation, brings a unique blend of technical expertise and creative vision to Ethnique's digital initiatives.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark-section py-24 px-4 text-center">
        <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
          Our Story
        </span>
        <h1 className="font-display text-5xl sm:text-6xl text-[#F7F3EB] mt-4 leading-tight max-w-3xl mx-auto">
          Born from the{" "}
          <span className="text-[#C8A86A] italic">Threads of India</span>
        </h1>
        <p className="font-sans text-sm text-[#A79C89] mt-6 max-w-xl mx-auto leading-relaxed">
          Ethnique was founded on one belief: that India's textile heritage is
          not a relic — it is a living, breathing art form that deserves to be
          worn every day.
        </p>
      </section>

      {/* Origin story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Monogram visual */}
        <div className="relative">
          <div className="bg-dark-section w-full aspect-square max-w-md mx-auto flex items-center justify-center">
            {/* Outer decorative gold ring */}
            <div className="absolute inset-6 rounded-full border border-[#C8A86A]/25" />
            {/* Ivory disc — same treatment as hero monogram */}
            <div className="w-4/5 h-4/5 rounded-full bg-[#F7F3EB] flex items-center justify-center shadow-2xl border border-[#C8A86A]/40">
              <Image
                src="/Monogram.png"
                alt="Ethnique Monogram"
                width={320}
                height={320}
                className="w-[85%] h-[85%] object-contain"
              />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-[#C8A86A] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-6 py-3 font-semibold">
            Since 2026
          </div>
        </div>

        <div>
          <h2 className="font-display text-4xl text-[#3B0F14] mb-6 leading-tight">
            A Celebration of Timeless Tradition
          </h2>
          <p className="font-sans text-sm text-[#A79C89] leading-relaxed mb-5">
            Ethnique began in the bylanes of Varanasi, watching a master weaver
            bring a silk thread to life on a loom that had seen three
            generations. Our founder Sasmita Pattanaik realised then that the most
            exquisite clothing in the world was being made by hands most
            shoppers would never meet.
          </p>
          <p className="font-sans text-sm text-[#A79C89] leading-relaxed mb-5">
            She set out to change that — not with nostalgia, but with
            conviction. Ethnique was built to carry these crafts forward: giving
            artisans a platform, giving customers a story, and giving Indian
            textiles the contemporary stage they deserve.
          </p>
          <p className="font-sans text-sm text-[#A79C89] leading-relaxed">
            Today we work with over 40 weaver families across eight states,
            each preserving a distinct regional tradition. Every piece you
            receive is a piece of that living heritage.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-[#C8A86A]/30" />
      </div>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
            What We Stand For
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-[#3B0F14] mt-2">
            Our Values
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#C8A86A]/20">
          {values.map(({ title, body }) => (
            <div key={title} className="bg-[#F7F3EB] p-10">
              <span className="text-[#C8A86A] text-xl">✦</span>
              <h3 className="font-display text-2xl text-[#3B0F14] mt-3 mb-3">
                {title}
              </h3>
              <p className="font-sans text-sm text-[#A79C89] leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-dark-section py-20 px-4">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-[#C8A86A]">
              The People
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#F7F3EB] mt-2">
              Meet the Team
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map(({ name, roles, bio }) => (
              <div key={name} className="text-center">
                {/* Avatar placeholder */}
                <div className="w-24 h-24 rounded-full border border-[#C8A86A]/40 flex items-center justify-center mx-auto mb-5 bg-[#3B0F14]">
                  <span className="font-display text-2xl text-[#C8A86A]">
                    {name[0]}
                  </span>
                </div>
                <h3 className="font-display text-xl text-[#F7F3EB]">{name}</h3>
                <div className="font-sans text-xs tracking-widest uppercase text-[#C8A86A] mt-1 mb-4 space-y-0.5">
                  {roles.map((role) => (
                    <p key={role}>{role}</p>
                  ))}
                </div>
                <p className="font-sans text-sm text-[#A79C89] leading-relaxed max-w-xs mx-auto">
                  {bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-4xl text-[#3B0F14] mb-4">
          Ready to Explore?
        </h2>
        <p className="font-sans text-sm text-[#A79C89] mb-8 leading-relaxed">
          Discover pieces that carry history and step into the world wearing a
          story.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-[#3B0F14] text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#C8A86A] hover:text-[#3B0F14] transition-colors duration-300"
          >
            Shop the Collection
          </Link>
          <Link
            href="/contact"
            className="border border-[#3B0F14] text-[#3B0F14] font-sans text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#3B0F14] hover:text-[#F7F3EB] transition-colors duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
