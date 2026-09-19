import type { AppState, Category, Food, Order, Rating, Restaurant, User } from "../types";

const API_BASE = "/api";

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loadRemoteAppState(): Promise<Partial<AppState> | null> {
  try {
    const [restaurants, foods, categories, orders, ratings] = await Promise.all([
      api<Restaurant[]>('/restaurants'),
      api<Food[]>('/foods'),
      api<Category[]>('/categories'),
      api<Order[]>('/orders'),
      api<Rating[]>('/reviews'),
    ]);

    return {
      restaurants: Array.isArray(restaurants) ? restaurants : [],
      foods: Array.isArray(foods) ? foods : [],
      categories: Array.isArray(categories) ? categories : [],
      orders: Array.isArray(orders) ? orders : [],
      ratings: Array.isArray(ratings) ? ratings : [],
    };
  } catch {
    return null;
  }
}

export async function getRestaurants(): Promise<Restaurant[]> {
  return api<Restaurant[]>('/restaurants');
}

export async function getFoods(): Promise<Food[]> {
  return api<Food[]>('/foods');
}

export async function getCategories(): Promise<Category[]> {
  return api<Category[]>('/categories');
}

export async function getOrders(): Promise<Order[]> {
  return api<Order[]>('/orders');
}

export async function getReviews(): Promise<Rating[]> {
  return api<Rating[]>('/reviews');
}

export async function getUser(id: string): Promise<User | null> {
  try {
    return await api<User>(`/users/${id}`);
  } catch {
    return null;
  }
}
