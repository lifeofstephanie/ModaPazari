export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

export type VendorOrder = {
  id: string;
  customer: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
  payment: "Paid" | "Pending";
};

// Placeholder orders until the vendor orders endpoint is wired.
export const orders: VendorOrder[] = [
  { id: "#2451", customer: "Annette Black", date: "3 Aug 2026", items: 2, total: "₦74,500", status: "Pending", payment: "Paid" },
  { id: "#2450", customer: "Wade Warren", date: "3 Aug 2026", items: 1, total: "₦28,500", status: "Processing", payment: "Paid" },
  { id: "#2449", customer: "Kristin Watson", date: "2 Aug 2026", items: 3, total: "₦132,000", status: "Shipped", payment: "Paid" },
  { id: "#2448", customer: "Ronald Richards", date: "2 Aug 2026", items: 1, total: "₦46,000", status: "Pending", payment: "Pending" },
  { id: "#2447", customer: "Savannah Nguyen", date: "1 Aug 2026", items: 2, total: "₦98,000", status: "Delivered", payment: "Paid" },
  { id: "#2446", customer: "Jacob Jones", date: "1 Aug 2026", items: 1, total: "₦52,000", status: "Delivered", payment: "Paid" },
  { id: "#2445", customer: "Courtney Henry", date: "31 Jul 2026", items: 4, total: "₦210,000", status: "Delivered", payment: "Paid" },
  { id: "#2444", customer: "Cameron Williamson", date: "31 Jul 2026", items: 2, total: "₦89,900", status: "Shipped", payment: "Paid" },
  { id: "#2443", customer: "Brooklyn Simmons", date: "30 Jul 2026", items: 1, total: "₦34,000", status: "Delivered", payment: "Paid" },
];
