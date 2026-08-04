import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const socials = [Facebook, Instagram, Twitter, Youtube];

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <section className="flex flex-col gap-5 md:col-span-1">
            <Image
              src="/images/logo.svg"
              width={170}
              height={44}
              alt="Moda Pazari"
              className="dark:invert dark:brightness-90"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Your premier destination for international fashion. Quality, style
              and affordability in one place.
            </p>
            <div className="flex gap-3">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-accent transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </section>

          {/* Links */}
          <FooterCol
            title="Quick Links"
            links={[
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Seasonal", href: "/seasonal" },
              { label: "Accessories", href: "/accessories" },
              { label: "Shop", href: "/shop" },
            ]}
          />
          <FooterCol
            title="Customer Service"
            links={[
              { label: "Help Center", href: "/helpCenter" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Refund Policy", href: "/refund" },
              { label: "Become a Vendor", href: "/vendor" },
            ]}
          />

          {/* Newsletter */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Stay Updated
            </h2>
            <p className="text-sm text-muted">
              Subscribe to get special offers and updates.
            </p>
            <form className="flex flex-col gap-3">
              <input
                placeholder="Enter your email"
                className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-accent"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-accent-solid text-sm font-medium text-white transition-colors hover:bg-accent-strong"
              >
                Subscribe
              </button>
            </form>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} Moda Pazari. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
    <ul className="flex flex-col gap-3 text-sm text-muted">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            href={l.href}
            className="cursor-pointer transition-colors hover:text-accent"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);
