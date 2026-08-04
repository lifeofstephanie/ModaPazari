import { Testimonials } from "@/data/testimonials";
import { Values } from "@/data/values";
import { Compass, Globe, Medal, Quote, User } from "lucide-react";

const stats = [
  { icon: User, value: "100k+", label: "Trusted by shoppers worldwide" },
  { icon: Globe, value: "150+", label: "Global brands & artisans" },
  { icon: Medal, value: "10+", label: "Years of expertise" },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* ---------------- Hero ---------------- */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            About Moda Pazari
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Empowering the world with{" "}
            <span className="font-[MomoSignature] font-normal text-accent">
              personalized fashion
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            We&apos;re not just selling fashion accessories — we&apos;re curating
            the future of personal expression and style. Our mission is to make
            advanced fashion, ethical sourcing, and effortless style accessible,
            inspiring and impactful for everyone.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <s.icon className="text-accent" size={26} strokeWidth={1.5} />
                <p className="mt-4 text-3xl font-semibold">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Mission / Vision ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <MissionRow
          eyebrow="Our Mission"
          title="Building Africa's most trusted fashion marketplace"
          image="/images/about1.jpg"
        >
          <p>
            We exist to solve the core challenges of online fashion retail across
            the region: trust, accessibility and variety.
          </p>
          <p>
            Our mission is to operate the most reliable and efficient platform
            that empowers everyone — from emerging local designers to
            style-conscious shoppers — to participate in the future of fashion.
          </p>
          <ul className="mt-2 flex list-disc flex-col gap-3 pl-5 text-muted">
            <li>
              <span className="font-medium text-foreground">
                For the shopper:
              </span>{" "}
              guarantee genuine quality and a hassle-free experience from click
              to delivery.
            </li>
            <li>
              <span className="font-medium text-foreground">
                For the vendor:
              </span>{" "}
              provide the digital infrastructure and logistics to scale a brand
              ethically and profitably.
            </li>
          </ul>
        </MissionRow>

        <MissionRow
          eyebrow="Our Vision"
          title="A stylized, seamless continent"
          image="/images/about2.jpg"
          reverse
        >
          <p>
            We envision a future where geography and logistics are no longer
            obstacles to self-expression.
          </p>
          <p>
            Our vision is to be the central style hub of Africa — a dynamic
            ecosystem where local creativity meets global demand, and where
            personalized style is achieved effortlessly and reliably.
          </p>
          <ul className="mt-2 flex list-decimal flex-col gap-3 pl-5 text-muted">
            <li>
              <span className="font-medium text-foreground">Lead in trust:</span>{" "}
              set the regional standard for authenticity, secure payments and
              transparent returns.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Innovate in delivery:
              </span>{" "}
              use cutting-edge logistics to shrink delivery times and expand
              reach.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Champion local talent:
              </span>{" "}
              drive the global recognition of African fashion designers and
              brands.
            </li>
          </ul>
        </MissionRow>
      </section>

      {/* ---------------- Values ---------------- */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Our values
            </h2>
            <p className="mt-3 text-muted">
              The principles that guide us in building a better commerce
              experience.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft">
                    <Icon className="text-accent" size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold">{value.name}</h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Loved by our community
          </h2>
          <p className="mt-3 text-muted">
            Great words that our clients have to say about us.
          </p>
        </div>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {Testimonials.slice(0, 9).map((t) => (
            <figure
              key={t.id}
              className="mb-5 break-inside-avoid rounded-2xl border border-border bg-card p-6"
            >
              <Quote className="text-accent" size={22} />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
                {t.testimonial}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-solid text-sm font-semibold text-white">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

function MissionRow({
  eyebrow,
  title,
  image,
  children,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  image: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 md:gap-16 ${
        reverse ? "mt-16 md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="w-full md:w-1/2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
          <Compass size={14} className="text-accent" />
          <span className="text-xs">{eyebrow}</span>
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-accent md:text-4xl">
          {title}
        </h2>
        <div className="mt-4 flex flex-col gap-4 leading-relaxed text-muted">
          {children}
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <img
          src={image}
          alt={title}
          className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
        />
      </div>
    </div>
  );
}