import type { AppState, Category, Food, Order, OrderItem, Owner, Rating, Restaurant } from "./types";

const KEY = "restaurant-qr-app-state-v1";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const youtubeSearch = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const restaurantId = "restaurant_demo";
const ownerId = "owner_demo";

const demoVideoUrls: Record<string, string> = {
  food_paneer: youtubeSearch("paneer tikka recipe"),
  food_biryani: youtubeSearch("veg biryani recipe"),
  food_curry: youtubeSearch("chicken curry recipe"),
  food_masala_chai: youtubeSearch("masala chai recipe"),
  food_filter_coffee: youtubeSearch("south indian filter coffee recipe"),
  food_sweet_lassi: youtubeSearch("sweet lassi recipe"),
  food_mango_lassi: youtubeSearch("mango lassi recipe"),
  food_fresh_lime_soda: youtubeSearch("fresh lime soda recipe"),
  food_jaljeera: youtubeSearch("jaljeera recipe"),
  food_buttermilk: youtubeSearch("masala buttermilk chaas recipe"),
  food_cold_coffee: youtubeSearch("cold coffee recipe"),
  food_watermelon_juice: youtubeSearch("watermelon juice recipe"),
  food_virgin_mojito: youtubeSearch("virgin mojito recipe"),
};

const demoDrinks: Food[] = [
  {
    id: "food_masala_chai",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Masala Chai",
    price: 35,
    description: "Hot tea brewed with milk, ginger, cardamom, and warming spices.",
    imageUrl: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_masala_chai,
    preparationTime: 6,
    available: true,
    averageRating: 4.7,
    totalRatings: 82,
    createdAt: now(),
  },
  {
    id: "food_filter_coffee",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Filter Coffee",
    price: 45,
    description: "South Indian style coffee with strong decoction and frothy milk.",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_filter_coffee,
    preparationTime: 7,
    available: true,
    averageRating: 4.8,
    totalRatings: 76,
    createdAt: now(),
  },
  {
    id: "food_sweet_lassi",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Sweet Lassi",
    price: 80,
    description: "Creamy chilled yoghurt drink finished with cardamom and pistachio.",
    imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_sweet_lassi,
    preparationTime: 8,
    available: true,
    averageRating: 4.6,
    totalRatings: 69,
    createdAt: now(),
  },
  {
    id: "food_mango_lassi",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Mango Lassi",
    price: 95,
    description: "Thick mango and yoghurt cooler blended smooth and served chilled.",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_mango_lassi,
    preparationTime: 8,
    available: true,
    averageRating: 4.9,
    totalRatings: 104,
    createdAt: now(),
  },
  {
    id: "food_fresh_lime_soda",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Fresh Lime Soda",
    price: 70,
    description: "Sparkling lime cooler served sweet, salted, or mixed.",
    imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_fresh_lime_soda,
    preparationTime: 5,
    available: true,
    averageRating: 4.5,
    totalRatings: 58,
    createdAt: now(),
  },
  {
    id: "food_jaljeera",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Jaljeera",
    price: 60,
    description: "Tangy cumin, mint, and lemon cooler with a punchy spice mix.",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_jaljeera,
    preparationTime: 5,
    available: true,
    averageRating: 4.4,
    totalRatings: 47,
    createdAt: now(),
  },
  {
    id: "food_buttermilk",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Masala Buttermilk",
    price: 55,
    description: "Cooling chaas with roasted cumin, coriander, curry leaves, and salt.",
    imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_buttermilk,
    preparationTime: 5,
    available: true,
    averageRating: 4.5,
    totalRatings: 63,
    createdAt: now(),
  },
  {
    id: "food_cold_coffee",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Cold Coffee",
    price: 110,
    description: "Iced coffee blended with milk, sugar, and a scoop of vanilla.",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_cold_coffee,
    preparationTime: 9,
    available: true,
    averageRating: 4.7,
    totalRatings: 91,
    createdAt: now(),
  },
  {
    id: "food_watermelon_juice",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Watermelon Juice",
    price: 90,
    description: "Fresh watermelon juice with mint and a light squeeze of lime.",
    imageUrl: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_watermelon_juice,
    preparationTime: 7,
    available: true,
    averageRating: 4.6,
    totalRatings: 52,
    createdAt: now(),
  },
  {
    id: "food_virgin_mojito",
    restaurantId,
    categoryId: "cat_drinks",
    name: "Virgin Mojito",
    price: 120,
    description: "Mint, lime, sugar, and soda muddled into a bright alcohol-free cooler.",
    imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=700&q=85",
    videoUrl: demoVideoUrls.food_virgin_mojito,
    preparationTime: 8,
    available: true,
    averageRating: 4.8,
    totalRatings: 88,
    createdAt: now(),
  },
];

const seed: AppState = {
  currentOwnerId: ownerId,
  owners: [
    {
      id: ownerId,
      name: "Demo Owner",
      email: "owner@demo.com",
      phone: "+91 98765 43210",
      password: "password123",
      restaurantId,
    },
  ],
  restaurants: [
    {
      id: restaurantId,
      ownerId,
      name: "Masala Table",
      logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80",
      coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85",
      address: "12 Market Road, Bengaluru",
      phone: "+91 98765 43210",
      email: "hello@masalatable.test",
      openingTime: "10:00",
      closingTime: "23:00",
      description: "Fresh Indian plates, tandoor snacks, biryani, desserts, and quick table service.",
      status: "open",
      createdAt: now(),
    },
  ],
  categories: [
    { id: "cat_starters", restaurantId, name: "Starters", sortOrder: 1, active: true },
    { id: "cat_mains", restaurantId, name: "Main Course", sortOrder: 2, active: true },
    { id: "cat_rice", restaurantId, name: "Rice", sortOrder: 3, active: true },
    { id: "cat_drinks", restaurantId, name: "Drinks", sortOrder: 4, active: true },
    { id: "cat_desserts", restaurantId, name: "Desserts", sortOrder: 5, active: true },
  ],
  foods: [
    {
      id: "food_paneer",
      restaurantId,
      categoryId: "cat_starters",
      name: "Paneer Tikka",
      price: 220,
      description: "Soft paneer marinated with ginger, chilli, yoghurt, and charred peppers.",
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=85",
      videoUrl: demoVideoUrls.food_paneer,
      preparationTime: 15,
      available: true,
      averageRating: 4.8,
      totalRatings: 128,
      createdAt: now(),
    },
    {
      id: "food_biryani",
      restaurantId,
      categoryId: "cat_rice",
      name: "Veg Biryani",
      price: 180,
      description: "Layered basmati rice with seasonal vegetables, saffron, and fried onions.",
      imageUrl: "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=700&q=85",
      videoUrl: demoVideoUrls.food_biryani,
      preparationTime: 20,
      available: true,
      averageRating: 4.6,
      totalRatings: 94,
      createdAt: now(),
    },
    {
      id: "food_curry",
      restaurantId,
      categoryId: "cat_mains",
      name: "Chicken Curry",
      price: 260,
      description: "Slow cooked chicken in a rich tomato-onion gravy with warm spices.",
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=85",
      videoUrl: demoVideoUrls.food_curry,
      preparationTime: 22,
      available: true,
      averageRating: 4.7,
      totalRatings: 71,
      createdAt: now(),
    },
    ...demoDrinks,
  ],
  orders: [],
  ratings: [],
};

function withDemoMenuUpdates(state: AppState): AppState {
  if (!state.restaurants.some((restaurant) => restaurant.id === restaurantId)) return state;
  const existingIds = new Set(state.foods.map((food) => food.id));
  const missingDrinks = demoDrinks.filter((drink) => !existingIds.has(drink.id));
  const foods = [...state.foods, ...missingDrinks].map((food) => {
    const videoUrl = demoVideoUrls[food.id];
    if (!videoUrl) return food;
    return { ...food, videoUrl };
  });
  return { ...state, foods };
}

export function loadState(): AppState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  const state = withDemoMenuUpdates(JSON.parse(raw) as AppState);
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("restaurant-state-updated"));
}

export function createOwner(state: AppState, form: Record<string, string>): AppState {
  const owner: Owner = {
    id: id("owner"),
    name: form.ownerName,
    email: form.email.toLowerCase(),
    phone: form.mobile,
    password: form.password,
    restaurantId: id("restaurant"),
    googleUid: form.googleUid || undefined,
    photoURL: form.photoURL || undefined,
  };
  const restaurant: Restaurant = {
    id: owner.restaurantId,
    ownerId: owner.id,
    name: form.restaurantName,
    logo: "",
    coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=85",
    address: form.address,
    phone: form.mobile,
    email: form.email.toLowerCase(),
    openingTime: "10:00",
    closingTime: "22:00",
    description: "A fresh digital menu ready for your first dishes.",
    status: "open",
    createdAt: now(),
  };
  return { ...state, owners: [...state.owners, owner], restaurants: [...state.restaurants, restaurant], currentOwnerId: owner.id };
}

export function addCategory(state: AppState, restaurantIdValue: string, name: string): AppState {
  const next: Category = { id: id("cat"), restaurantId: restaurantIdValue, name, sortOrder: state.categories.length + 1, active: true };
  return { ...state, categories: [...state.categories, next] };
}

export function upsertFood(state: AppState, food: Partial<Food> & Pick<Food, "restaurantId" | "name" | "categoryId">): AppState {
  if (food.id) {
    return { ...state, foods: state.foods.map((item) => (item.id === food.id ? { ...item, ...food } as Food : item)) };
  }
  const next: Food = {
    id: id("food"),
    restaurantId: food.restaurantId,
    categoryId: food.categoryId,
    name: food.name,
    price: Number(food.price || 0),
    description: food.description || "",
    imageUrl: food.imageUrl || "",
    videoUrl: food.videoUrl || "",
    preparationTime: Number(food.preparationTime || 10),
    available: food.available ?? true,
    averageRating: 0,
    totalRatings: 0,
    createdAt: now(),
  };
  return { ...state, foods: [...state.foods, next] };
}

export function createOrder(state: AppState, restaurantIdValue: string, tableNumber: string, lines: { foodId: string; quantity: number }[], paymentMethod: Order["paymentMethod"]) {
  const foods = state.foods.filter((food) => lines.some((line) => line.foodId === food.id));
  const items: OrderItem[] = lines.map((line) => {
    const food = foods.find((item) => item.id === line.foodId)!;
    return { foodId: food.id, name: food.name, quantity: line.quantity, price: food.price };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const activeCount = state.orders.filter((order) => order.restaurantId === restaurantIdValue && order.orderStatus !== "COMPLETED").length;
  const order: Order = {
    id: id("order"),
    restaurantId: restaurantIdValue,
    tokenNumber: `A${104 + activeCount}`,
    tableNumber: tableNumber || "Takeaway",
    items,
    subtotal,
    totalAmount: subtotal,
    paymentMethod,
    paymentStatus: paymentMethod === "Cash" ? "PENDING" : "PENDING",
    orderStatus: "PLACED",
    customerSessionId: getCustomerSessionId(),
    createdAt: now(),
    orderType: tableNumber ? "Dine-in" : "Takeaway",
  };
  return { state: { ...state, orders: [order, ...state.orders] }, order };
}

export function addRatings(state: AppState, orderIdValue: string, values: Record<string, number>, review: string): AppState {
  const order = state.orders.find((item) => item.id === orderIdValue);
  if (!order || order.orderStatus !== "COMPLETED" || order.ratingSubmitted) return state;
  const created: Rating[] = order.items.map((item) => ({
    id: id("rating"),
    restaurantId: order.restaurantId,
    foodId: item.foodId,
    orderId: order.id,
    rating: values[item.foodId] || 5,
    review,
    createdAt: now(),
  }));
  const foods = state.foods.map((food) => {
    const matching = created.filter((rating) => rating.foodId === food.id);
    if (!matching.length) return food;
    const totalScore = food.averageRating * food.totalRatings + matching.reduce((sum, rating) => sum + rating.rating, 0);
    const totalRatings = food.totalRatings + matching.length;
    return { ...food, totalRatings, averageRating: Number((totalScore / totalRatings).toFixed(1)) };
  });
  return {
    ...state,
    foods,
    ratings: [...created, ...state.ratings],
    orders: state.orders.map((item) => (item.id === orderIdValue ? { ...item, ratingSubmitted: true } : item)),
  };
}

export function getCustomerSessionId() {
  const existing = localStorage.getItem("restaurant-qr-customer-session");
  if (existing) return existing;
  const next = id("session");
  localStorage.setItem("restaurant-qr-customer-session", next);
  return next;
}
