import type { Metadata } from "next";
import { LegalShell, type LegalSection } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Moda Pazari",
  description:
    "How Moda Pazari collects, uses, and protects your personal data.",
};

const sections: LegalSection[] = [
  {
    heading: "Overview",
    body: [
      "This Privacy Policy explains how Moda Pazari (\"we\", \"us\") collects, uses, shares, and protects your personal data when you use our marketplace. We are committed to handling your data responsibly and in line with the Nigeria Data Protection Act and other applicable laws.",
    ],
  },
  {
    heading: "Information We Collect",
    body: [
      "Account data: your name, email address, phone number, password (stored in hashed form), and role (buyer or vendor).",
      "Transaction data: orders, items purchased, delivery address, and payment status. Full card details are handled by our payment providers, not stored by us.",
      "Vendor data: business name, product listings, and payout details.",
      "Usage data: device, browser, IP address, and interactions with the Platform, collected to keep the service secure and to improve it.",
    ],
  },
  {
    heading: "How We Use Your Data",
    body: [
      "To create and manage your account; to process orders, payments, and payouts; to provide customer support; to prevent fraud and secure the Platform; to send service and, where you have consented, marketing communications; and to comply with legal obligations.",
    ],
  },
  {
    heading: "Legal Bases",
    body: [
      "We process your data on the bases of: performance of a contract (to provide the service you request), your consent (for optional communications), our legitimate interests (to secure and improve the Platform), and compliance with legal obligations.",
    ],
  },
  {
    heading: "Sharing Your Data",
    body: [
      "We share data with: vendors (to fulfil your orders), payment providers such as Paystack and Stripe, delivery partners, and service providers who help us operate the Platform. We may disclose data where required by law. We do not sell your personal data.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We keep personal data for as long as your account is active and as needed to provide the service, then for any additional period required to meet legal, tax, or accounting obligations, after which it is deleted or anonymised.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "Subject to applicable law, you may request access to your data, correction of inaccurate data, deletion, restriction of processing, and portability, and you may withdraw consent to marketing at any time. To exercise these rights, contact us using the details below.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, and understand how the Platform is used. You can control cookies through your browser settings; disabling some may affect functionality.",
    ],
  },
  {
    heading: "Security",
    body: [
      "We use technical and organisational measures — including encryption in transit, hashed passwords, and access controls — to protect your data. No method of transmission or storage is completely secure, but we work to protect your information and to notify you of significant incidents where required.",
    ],
  },
  {
    heading: "Children",
    body: [
      "The Platform is not directed at children under 18, and we do not knowingly collect their personal data.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "We may update this Policy from time to time. Material changes will be notified through the Platform, and the \"last updated\" date above will reflect the latest revision.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy describes what data we collect, why we collect it, and the choices you have."
      updated="3 August 2026"
      sections={sections}
    />
  );
}
