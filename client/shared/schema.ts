// MongoDB-compatible types
import { z } from "zod";

export interface Product {
  _id: string;
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
  _id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

export interface Wishlist {
  _id: string;
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

// Type aliases for API responses
export type AppProduct = Product;
export type AppReview = Review;
export type AppCartItem = CartItem;
export type AppCart = Cart;
export type AppWishlist = Wishlist;
export type AppUser = User;

// Type aliases for insert operations
export type InsertProduct = Omit<Product, "_id">;
export type InsertReview = Omit<Review, "_id" | "createdAt">;
export type InsertCart = Omit<Cart, "_id" | "updatedAt">;
export type InsertWishlist = Omit<Wishlist, "_id" | "updatedAt">;
export type InsertUser = Omit<User, "_id">; 

export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

