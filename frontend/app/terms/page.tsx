import type { Metadata } from "next";
import { LegalShell, type LegalSection } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | Moda Pazari",
  description:
    "The terms governing your use of the Moda Pazari marketplace as a buyer or vendor.",
};

const sections: LegalSection[] = [
  {
    heading: "Introduction",
    body: [
      "These Terms & Conditions (\"Terms\") govern your access to and use of the Moda Pazari marketplace, including our website, applications, and related services (collectively, the \"Platform\"). By creating an account, browsing, or making a purchase, you agree to be bound by these Terms.",
      "Moda Pazari is a multi-vendor marketplace that connects independent fashion vendors with buyers. We provide the Platform; the products are sold by third-party vendors.",
    ],
  },
  {
    heading: "Eligibility & Accounts",
    body: [
      "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
      "You agree to provide accurate, current, and complete information and to keep it updated. We may suspend or terminate accounts that contain false information or that are used in breach of these Terms.",
    ],
  },
  {
    heading: "Buyers",
    body: [
      "When you place an order, you make an offer to purchase a product from a vendor at the listed price. An order is confirmed once payment has been authorised and the vendor accepts it.",
      "Prices are listed in Nigerian Naira (₦) unless otherwise stated and may include or exclude delivery fees and applicable taxes as shown at checkout.",
    ],
  },
  {
    heading: "Vendors",
    body: [
      "Vendors are independent sellers responsible for their own listings, pricing, stock accuracy, fulfilment, and compliance with applicable laws. By listing a product, you warrant that you have the right to sell it and that the listing is accurate and not misleading.",
      "New product listings may be reviewed before being published. We may remove listings that violate these Terms, infringe third-party rights, or are otherwise prohibited.",
      "Payouts to vendors are made according to our payout schedule, net of applicable platform fees and any refunds or chargebacks.",
    ],
  },
  {
    heading: "Payments",
    body: [
      "Payments are processed by third-party payment providers (such as Paystack and Stripe). By making a payment, you agree to the applicable provider's terms. We do not store full card details on our servers.",
      "You authorise us and our payment providers to charge your selected payment method for the total amount of your order, including delivery and taxes where applicable.",
    ],
  },
  {
    heading: "Prohibited Conduct",
    body: [
      "You agree not to misuse the Platform, including by: posting unlawful, counterfeit, or infringing content; attempting to gain unauthorised access; interfering with the operation of the Platform; or using it to defraud other users.",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      "The Platform, including its branding, design, and software, is owned by Moda Pazari or its licensors and is protected by intellectual property laws. Vendor and buyer content remains the property of its respective owner, who grants us a licence to display it for the operation of the Platform.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      "The Platform is provided \"as is\". To the fullest extent permitted by law, Moda Pazari is not liable for indirect, incidental, or consequential damages arising from your use of the Platform or from transactions between buyers and vendors.",
    ],
  },
  {
    heading: "Governing Law",
    body: [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be subject to the jurisdiction of the Nigerian courts, without prejudice to any mandatory consumer protection rights.",
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Material changes will be notified through the Platform. Your continued use after changes take effect constitutes acceptance of the updated Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="Please read these terms carefully before using the Moda Pazari marketplace. They set out the rules for buyers and vendors and the basis on which we provide the Platform."
      updated="3 August 2026"
      sections={sections}
    />
  );
}
