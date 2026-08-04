import type { Metadata } from "next";
import { LegalShell, type LegalSection } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Refund & Returns Policy | Moda Pazari",
  description:
    "How returns, refunds, and exchanges work on the Moda Pazari marketplace.",
};

const sections: LegalSection[] = [
  {
    heading: "Overview",
    body: [
      "This Refund & Returns Policy explains how returns, refunds, and exchanges work on Moda Pazari. Because Moda Pazari is a multi-vendor marketplace, some items are sold by independent vendors who may set additional conditions; where a vendor's policy is stricter than the law allows, your statutory rights still apply.",
    ],
  },
  {
    heading: "Return Window",
    body: [
      "You may request a return within 7 days of receiving your order, provided the item is eligible. The item must be unused, unworn, unwashed, with tags attached, and in its original packaging.",
    ],
  },
  {
    heading: "Non-Returnable Items",
    body: [
      "For hygiene and safety reasons, the following are generally not eligible for return unless faulty: underwear and swimwear, pierced jewellery such as earrings, cosmetics that have been opened, and items marked as final sale or custom-made.",
    ],
  },
  {
    heading: "Faulty or Incorrect Items",
    body: [
      "If an item arrives damaged, defective, or not as described, contact us within 48 hours of delivery with photos. You are entitled to a repair, replacement, or full refund, including original delivery costs where the fault is ours or the vendor's.",
    ],
  },
  {
    heading: "How to Request a Return",
    body: [
      "Go to your orders, select the item, and choose \"Request return\", or email support@modapazari.com with your order number and reason. We will respond with return instructions and, where applicable, a return address for the vendor.",
    ],
  },
  {
    heading: "Refunds",
    body: [
      "Once your returned item is received and inspected, we will notify you of the outcome. Approved refunds are issued to your original payment method, typically within 5–10 business days, depending on your bank or payment provider.",
      "Delivery charges are non-refundable except where the return is due to a fault or an error on our or the vendor's part.",
    ],
  },
  {
    heading: "Exchanges",
    body: [
      "If you need a different size or colour, the fastest option is to return the original item for a refund and place a new order, subject to availability.",
    ],
  },
  {
    heading: "Return Shipping",
    body: [
      "Unless the item is faulty or incorrect, you are responsible for the cost of return shipping. We recommend using a trackable service, as we cannot process a refund for items we do not receive.",
    ],
  },
  {
    heading: "Order Cancellations",
    body: [
      "You may cancel an order before it is dispatched for a full refund. Once an order has been dispatched, the standard returns process applies.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "For any questions about returns or refunds, contact our support team at support@modapazari.com. Nothing in this policy affects your statutory consumer rights.",
    ],
  },
];

export default function RefundPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Refund & Returns Policy"
      intro="We want you to love what you buy. If something isn't right, here's how returns, refunds, and exchanges work on Moda Pazari."
      updated="3 August 2026"
      sections={sections}
    />
  );
}
