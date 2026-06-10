import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-dark-section text-[#F7F3EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/Logo.png"
              alt="Ethnique"
              width={220}
              height={80}
              className="h-20 w-auto object-contain brightness-0 invert mb-6"
            />
            <p className="font-sans text-sm text-[#A79C89] leading-relaxed max-w-xs">
              Ethnique is a celebration of timeless tradition and contemporary
              style. Our pieces are crafted to be worn, shared, and cherished.
            </p>
            <p className="font-sans text-xs tracking-widest uppercase text-[#C8A86A] mt-4">
              Wear ✦ Celebrate ✦ Share
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-sans text-xs tracking-widest uppercase text-[#C8A86A] mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {["Home", "About", "Collections", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="font-sans text-sm text-[#A79C89] hover:text-[#F7F3EB] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs tracking-widest uppercase text-[#C8A86A] mb-5">
              Get In Touch
            </h3>
            <ul className="space-y-3 font-sans text-sm text-[#A79C89]">
              <li>hello@ethnique.co.uk</li>
              <li>+44 20 7946 0321</li>
              <li className="leading-relaxed">
                London, England<br />United Kingdom
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#C8A86A]/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-[#A79C89]">
            © {new Date().getFullYear()} Ethnique. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center sm:justify-end">
            {[
              { label: "Returns Policy", href: "/returns" },
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Use", href: "#" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-sans text-xs text-[#A79C89] hover:text-[#C8A86A] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
