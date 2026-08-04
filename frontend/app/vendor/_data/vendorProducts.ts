export type ProductStatus = "Approved" | "Pending" | "Rejected";

export type VendorProduct = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: ProductStatus;
};

// Placeholder catalog until vendorService.getProducts() is wired in.
export const vendorProducts: VendorProduct[] = [
  { id: "p1", name: "Aeroflow Linen Shirt", category: "Menswear", price: "₦28,500", stock: 42, status: "Approved" },
  { id: "p2", name: "Silk Wrap Midi Dress", category: "Womenswear", price: "₦46,000", stock: 18, status: "Approved" },
  { id: "p3", name: "Handwoven Gold Ring Set", category: "Accessories", price: "₦74,000", stock: 9, status: "Approved" },
  { id: "p4", name: "Structured Wool Jacket", category: "Outerwear", price: "₦89,900", stock: 24, status: "Pending" },
  { id: "p5", name: "Suede Ankle Boots", category: "Footwear", price: "₦52,000", stock: 12, status: "Approved" },
  { id: "p6", name: "Pleated Maxi Skirt", category: "Womenswear", price: "₦39,500", stock: 0, status: "Rejected" },
  { id: "p7", name: "Cashmere Scarf", category: "Accessories", price: "₦21,000", stock: 60, status: "Pending" },
];
