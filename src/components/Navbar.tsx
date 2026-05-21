"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/collections", label: "Collections" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3EB]/95 backdrop-blur-sm border-b border-[#C8A86A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/Logo.png"
              alt="Ethnique"
              width={300}
              height={80}
              className="h-20 w-auto object-contain scale-[1.18] origin-left"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-sans text-sm tracking-widest uppercase transition-colors duration-200 ${
                  pathname === href
                    ? "text-[#C8A86A]"
                    : "text-[#3B0F14] hover:text-[#C8A86A]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/collections"
              className="bg-[#3B0F14] text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[#C8A86A] transition-colors duration-300"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#3B0F14]"
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" />
            <span className="block w-6 h-0.5 bg-current mb-1.5 transition-all" />
            <span className="block w-6 h-0.5 bg-current transition-all" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F7F3EB] border-t border-[#C8A86A]/20 px-4 py-6 flex flex-col gap-5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`font-sans text-sm tracking-widest uppercase ${
                pathname === href ? "text-[#C8A86A]" : "text-[#3B0F14]"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/collections"
            onClick={() => setMenuOpen(false)}
            className="bg-[#3B0F14] text-[#F7F3EB] font-sans text-xs tracking-widest uppercase px-5 py-2.5 text-center hover:bg-[#C8A86A] transition-colors duration-300"
          >
            Shop Now
          </Link>
        </div>
      )}
    </header>
  );
}
