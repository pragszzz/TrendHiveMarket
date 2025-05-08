import { z } from "zod";

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory: string;
  images: string[];
  sizes: string[];
  colors: Array<{
    name: string;
    code: string;
  }>;
  inventory: number;
  featured: boolean;
  newArrival: boolean;
  onSale: boolean;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CartItem {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  updatedAt: Date;
}

export interface Wishlist {
  id: number;
  userId: number;
  productIds: number[];
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
}

export type AppProduct = Product;
export type AppReview = Review;
export type AppCartItem = CartItem;
export type AppCart = Cart;
export type AppWishlist = Wishlist;
export type AppUser = User;

export type InsertProduct = Omit<Product, "id">;
export type InsertReview = Omit<Review, "id" | "createdAt">;
export type InsertCart = Omit<Cart, "id" | "updatedAt">;
export type InsertWishlist = Omit<Wishlist, "id" | "updatedAt">;
export type InsertUser = Omit<User, "id">;

export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["user", "admin"]),
}); 