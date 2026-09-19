export type RestaurantStatus = "open" | "closed";
export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type PaymentMethod = "Cash" | "Online Payment";

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantId: string;
  googleUid?: string;
  photoURL?: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  logo: string;
  coverImage: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  description: string;
  status: RestaurantStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface Food {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  videoUrl: string;
  preparationTime: number;
  available: boolean;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

export interface CartLine {
  foodId: string;
  quantity: number;
}

export interface OrderItem {
  foodId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tokenNumber: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerSessionId: string;
  ratingSubmitted?: boolean;
  createdAt: string;
  orderType?: "Dine-in" | "Takeaway";
  profit?: number;
}

export interface Rating {
  id: string;
  restaurantId: string;
  foodId: string;
  orderId: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface AppState {
  owners: Owner[];
  restaurants: Restaurant[];
  categories: Category[];
  foods: Food[];
  orders: Order[];
  ratings: Rating[];
  currentOwnerId?: string;
}
