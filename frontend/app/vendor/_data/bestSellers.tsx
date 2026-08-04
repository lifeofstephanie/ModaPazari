export type BestSeller = {
  id: string;
  product: string;
  category: string;
  brand: string;
  price: string;
  stock: number;
  rating: number;
  order: number;
  sales: string;
};

// Placeholder catalog until the vendor products endpoint is wired.
export const bestSellers: BestSeller[] = [
  {
    id: "#1",
    product: "Aeroflow Linen Shirt",
    category: "Menswear",
    brand: "Moda Studio",
    price: "₦28,500",
    stock: 42,
    rating: 4.8,
    order: 540,
    sales: "₦2.1M",
  },
  {
    id: "#2",
    product: "Silk Wrap Midi Dress",
    category: "Womenswear",
    brand: "Lagos Atelier",
    price: "₦46,000",
    stock: 18,
    rating: 4.9,
    order: 512,
    sales: "₦1.9M",
  },
  {
    id: "#3",
    product: "Handwoven Gold Ring Set",
    category: "Accessories",
    brand: "Aurum",
    price: "₦74,000",
    stock: 9,
    rating: 4.7,
    order: 388,
    sales: "₦1.4M",
  },
  {
    id: "#4",
    product: "Structured Wool Jacket",
    category: "Outerwear",
    brand: "Northline",
    price: "₦89,900",
    stock: 24,
    rating: 4.6,
    order: 301,
    sales: "₦1.2M",
  },
  {
    id: "#5",
    product: "Suede Ankle Boots",
    category: "Footwear",
    brand: "Terra",
    price: "₦52,000",
    stock: 12,
    rating: 4.6,
    order: 276,
    sales: "₦980k",
  },
];
