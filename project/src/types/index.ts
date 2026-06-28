export interface Product {
  id: string;
  title: string;
  animeName: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  type: "poster" | "sticker";
  rating: number;
  reviews: number;
  description: string;
  featured?: boolean;
  trending?: boolean;
}

export interface Collection {
  id: number;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
