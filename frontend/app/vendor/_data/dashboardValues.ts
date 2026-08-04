import {
  Banknote,
  Package,
  ShoppingBag,
  Undo2,
  type LucideIcon,
} from "lucide-react";

export type StatTrend = "up" | "down" | "flat";

export type StatValue = {
  name: string;
  value: string;
  delta: string;
  trend: StatTrend;
  icon: LucideIcon;
};

// Placeholder figures until the vendor stats endpoint is wired.
// Amounts are in Naira (₦) to match the storefront.
export const Values: StatValue[] = [
  {
    name: "Revenue (30d)",
    value: "₦4.28M",
    delta: "+12.5%",
    trend: "up",
    icon: Banknote,
  },
  {
    name: "Orders",
    value: "1,204",
    delta: "+4.2%",
    trend: "up",
    icon: ShoppingBag,
  },
  {
    name: "Products Live",
    value: "86",
    delta: "+3",
    trend: "up",
    icon: Package,
  },
  {
    name: "Returns",
    value: "18",
    delta: "-1.1%",
    trend: "down",
    icon: Undo2,
  },
];
