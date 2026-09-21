import type { AppState, Category, Food, Order, Rating, Restaurant, User } from "../types";

export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export async function requestApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const body = await response.json() as { message?: string };
      message = body.message || message;
    } catch {
      // Keep the status-based error when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function api<T>(path: string): Promise<T> {
  return requestApi<T>(path);
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
