export interface ClothesItem {
  id: number;
  name: string;
  price: string;
  description: string;
  img: string;
  thumbnails: string[];
  tag: string;
  colors: string[];
  sizes: string[];
  category: string;
  arEnabled?: boolean;
  model3D?: string;
  overlayImage?: string;
  currency: string;
}

export const CLOTHES_DATA: ClothesItem[] = [
  {
    id: 1,
    name: "Neural Knit Overshirt",
    price: "120",
    currency: "$",
    description:
      "A digital-first garment, crafted from recycled liquid silk. Its seamless construction offers unparalleled comfort and a futuristic silhouette.",
    img: "/images/shirt1.jpg",
    thumbnails: [
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB"],
    sizes: ["S", "M", "L", "XL"],
    category: "Winter",
    arEnabled: true,

    // model3D: "/models/iso-thermal-jacket.glb",
  },
  {
    id: 2,
    name: "ISO-Thermal Jacket",
    price: "250",
    currency: "$",
    description:
      "Engineered for extreme environments using computational heat-mapping technology. Lightweight yet exceptionally warm.",
    img: "/images/jacket1.jpg",
    thumbnails: [
      "/images/jacket1.jpg",
      "/images/jacket1.jpg",
      "/images/jacket1.jpg",
    ],
    tag: "Limited",
    colors: ["#111827", "#374151", "#6B7280"],
    sizes: ["M", "L", "XL"],
    category: "Winter",
    arEnabled: true,
    overlayImage: "/images/jacket1.jpg",
    // model3D: "/models/iso-thermal-jacket.glb",
  },
  {
    id: 3,
    name: "Liquid Silk Blouse",
    price: "180",
    currency: "$",
    description:
      "A blend of organic silk and bio-polymers. This piece flows like water and adapts to your body temperature.",
    img: "/images/shirt2.jpg",
    thumbnails: [
      "/images/shirt2.jpg",
      "/images/shirt2.jpg",
      "/images/shirt2.jpg",
    ],
    tag: "Sustainable",
    colors: ["#F5F3FF", "#E0E7FF", "#DDD6FE"],
    sizes: ["XS", "S", "M", "L"],
    category: "Winter",
    arEnabled: true,
    // model3D: "/models/iso-thermal-jacket.glb",
  },
  {
    id: 4,
    name: "Knitted Sweater",
    price: "150",
    currency: "$",
    description:
      "A digital-first garment, crafted from recycled liquid silk. Its seamless construction offers unparalleled comfort and a futuristic silhouette.",
    img: "/images/shirt1.jpg",
    thumbnails: [
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB"],
    sizes: ["S", "M", "L", "XL"],
    category: "Winter",
  },
  {
    id: 5,
    name: "Neural Knit Overshirt",
    price: "120",
    currency: "$",
    description:
      "A digital-first garment, crafted from recycled liquid silk. Its seamless construction offers unparalleled comfort and a futuristic silhouette.",
    img: "/images/shirt1.jpg",
    thumbnails: [
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB"],
    sizes: ["S", "M", "L", "XL"],
    category: "Winter",
  },
  {
    id: 6,
    name: "ISO-Thermal Jacket",
    price: "250",
    currency: "$",
    description:
      "Engineered for extreme environments using computational heat-mapping technology. Lightweight yet exceptionally warm.",
    img: "/images/jacket1.jpg",
    thumbnails: [
      "/images/jacket1.jpg",
      "/images/jacket1.jpg",
      "/images/jacket1.jpg",
    ],
    tag: "Limited",
    colors: ["#111827", "#374151", "#6B7280"],
    sizes: ["M", "L", "XL"],
    category: "Winter",
  },
  {
    id: 7,
    name: "Liquid Silk Blouse",
    price: "180",
    currency: "$",
    description:
      "A blend of organic silk and bio-polymers. This piece flows like water and adapts to your body temperature.",
    img: "/images/shirt2.jpg",
    thumbnails: [
      "/images/shirt2.jpg",
      "/images/shirt2.jpg",
      "/images/shirt2.jpg",
    ],
    tag: "Sustainable",
    colors: ["#F5F3FF", "#E0E7FF", "#DDD6FE"],
    sizes: ["XS", "S", "M", "L"],
    category: "Winter",
  },
  {
    id: 8,
    name: "Knitted Sweater",
    price: "150",
    currency: "$",
    description:
      "A digital-first garment, crafted from recycled liquid silk. Its seamless construction offers unparalleled comfort and a futuristic silhouette.",
    img: "/images/shirt1.jpg",
    thumbnails: [
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
      "/images/shirt1.jpg",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB"],
    sizes: ["S", "M", "L", "XL"],
    category: "Winter",
  },
  {
    id: 9,
    name: "Tank Top",
    price: "20",
    currency: "$",
    description:
      "A minimalist warm-weather staple, knitted with airy fibers for maximum ventilation. Its sleeveless silhouette keeps you cool while maintaining effortless style.",
    img: "/images/tanktop.png",
    thumbnails: [
      "/images/tanktop.png",
      "/images/tanktop.png",
      "/images/tanktop.png",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB", "#FFFFFF"],
    sizes: ["S", "M", "L", "XL"],
    category: "Summer",
    arEnabled: true,
    // model3D: "/models/iso-thermal-jacket.glb",
  },
  {
    id: 10,
    name: "AeroFlow Linen Shirt",
    price: "20",
    currency: "$",
    description:
      "A precision-woven linen garment engineered for maximum airflow. Its lightweight structure delivers cooling comfort with a clean, modern silhouette.",
    img: "/images/Aeroflow_Linen_Shirt.jpg",
    thumbnails: [
      "/images/Aeroflow_Linen_Shirt.jpg",
      "/images/Aeroflow_Linen_Shirt.jpg",
      "/images/Aeroflow_Linen_Shirt.jpg",
    ],
    tag: "New Tech",
    colors: ["#0F3D2E", "#1F2937", "#E5E7EB", "#FFFFFF"],
    sizes: ["S", "M", "L", "XL"],
    category: "Summer",
    arEnabled: true,
    // model3D: "/models/iso-thermal-jacket.glb",
  },
  {
    id: 11,
    name: "African Luxury Necklace",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/africanluxury.jpg",
    thumbnails: [
      "/images/rings/africanluxury.jpg",
      "/images/rings/africanluxury.jpg",
      "/images/rings/africanluxury.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 12,
    name: "Shiny Elegant Chain",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/displayshinyelegantgoldchain.jpg",
    thumbnails: [
      "/images/rings/displayshinyelegantgoldchain.jpg",
      "/images/rings/displayshinyelegantgoldchain.jpg",
      "/images/rings/displayshinyelegantgoldchain.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 13,
    name: "Elegant Diamond Wedding Ring",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/elegantgoldweddingring.jpg",
    thumbnails: [
      "/images/rings/elegantgoldweddingring.jpg",
      "/images/rings/elegantgoldweddingring.jpg",
      "/images/rings/elegantgoldweddingring.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 14,
    name: "Ring Set",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/expensivegoldenringdisplayedrocks.jpg",
    thumbnails: [
      "/images/rings/expensivegoldenringdisplayedrocks.jpg",
      "/images/rings/expensivegoldenringdisplayedrocks.jpg",
      "/images/rings/expensivegoldenringdisplayedrocks.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 15,
    name: "Layered Heart Necklace Set",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/threelayeredgoldheartset.jpg",
    thumbnails: [
      "/images/rings/threelayeredgoldheartset.jpg",
      "/images/rings/threelayeredgoldheartset.jpg",
      "/images/rings/threelayeredgoldheartset.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 16,
    name: "Layered Necklace Set",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/threelayeredgoldset.jpg",
    thumbnails: [
      "/images/rings/threelayeredgoldset.jpg",
      "/images/rings/threelayeredgoldset.jpg",
      "/images/rings/threelayeredgoldset.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
  {
    id: 17,
    name: "Elegant Ring Set",
    price: "200",
    currency: "$",
    description:
      "A piece of necklace made of african resources, known for its riches and fine materials.",
    img: "/images/rings/viewluxuriousgoldenringfeltjewelrydisplay.jpg",
    thumbnails: [
      "/images/rings/viewluxuriousgoldenringfeltjewelrydisplay.jpg",
      "/images/rings/viewluxuriousgoldenringfeltjewelrydisplay.jpg",
      "/images/rings/viewluxuriousgoldenringfeltjewelrydisplay.jpg",
    ],
    tag: "Luxury",
    colors: ["#FFD700", "#C0C0C0", "#D4AF37"],
    sizes: ['	12–13"', '14–16"', '17–19"', '20–24"'],
    category: "Jewelry",
  },
];
