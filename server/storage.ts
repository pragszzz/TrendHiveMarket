import session from "express-session";
import createMemoryStore from "memorystore";
import { log } from "./vite";
import * as schema from "../shared/schema";
import type { AppUser, AppProduct, AppCart, AppWishlist, AppOrder, AppReview } from "../shared/schema";
import type { MemoryStore as ExpressMemoryStore } from 'express-session';

// Fixed typescript session store issue
const MemoryStore = createMemoryStore(session);

// extend the interface with CRUD methods needed for e-commerce
export interface IStorage {
  // Session store
  sessionStore: any; // Using any for sessionStore to avoid type issues
  
  // User methods
  getUser(id: string): Promise<AppUser | undefined>;
  getUserByUsername(username: string): Promise<AppUser | undefined>;
  getUserByEmail(email: string): Promise<AppUser | undefined>;
  createUser(user: schema.InsertUser): Promise<AppUser>;
  updateUser(id: string, user: Partial<AppUser>): Promise<AppUser | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Product methods
  getProducts(options?: { category?: string; subCategory?: string }): Promise<AppProduct[]>;
  getProduct(id: string): Promise<AppProduct | undefined>;
  searchProducts(query: string): Promise<AppProduct[]>;
  getFeaturedProducts(): Promise<AppProduct[]>;
  getNewArrivals(): Promise<AppProduct[]>;
  getSaleProducts(): Promise<AppProduct[]>;
  createProduct(product: schema.InsertProduct): Promise<AppProduct>;
  updateProduct(id: string, product: Partial<AppProduct>): Promise<AppProduct | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Cart methods
  getCart(userId: string): Promise<AppCart | undefined>;
  getCartByUserId(userId: string): Promise<AppCart | undefined>;
  createCart(cart: schema.InsertCart): Promise<AppCart>;
  updateCart(userId: string, items: CartItem[]): Promise<AppCart>;
  deleteCart(id: string): Promise<boolean>;
  
  // Wishlist methods
  getWishlist(userId: string): Promise<AppWishlist | undefined>;
  getWishlistByUserId(userId: string): Promise<AppWishlist | undefined>;
  createWishlist(wishlist: schema.InsertWishlist): Promise<AppWishlist>;
  updateWishlist(userId: string, productIds: string[]): Promise<AppWishlist>;
  deleteWishlist(id: string): Promise<boolean>;
  
  // Order methods
  getOrders(userId: string): Promise<AppOrder[]>;
  getOrder(id: string): Promise<AppOrder | undefined>;
  createOrder(orderData: schema.InsertOrder): Promise<AppOrder>;
  updateOrder(id: string, order: Partial<AppOrder>): Promise<AppOrder | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  
  // Review methods
  getReview(id: string): Promise<AppReview | undefined>;
  getProductReviews(productId: string): Promise<AppReview[]>;
  createReview(review: schema.InsertReview): Promise<AppReview>;
  updateReview(id: string, review: Partial<AppReview>): Promise<AppReview | undefined>;
  deleteReview(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, AppUser>;
  private products: Map<string, AppProduct>;
  private carts: Map<string, AppCart>;
  private wishlists: Map<string, AppWishlist>;
  private orders: Map<string, AppOrder>;
  private reviews: Map<string, AppReview>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartId: number;
  private currentWishlistId: number;
  private currentOrderId: number;
  private currentReviewId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.wishlists = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartId = 1;
    this.currentWishlistId = 1;
    this.currentOrderId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Seed some products
    this.seedProducts();
  }

  // User methods
  async getUser(id: string): Promise<AppUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<AppUser | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<AppUser | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: schema.InsertUser): Promise<AppUser> {
    const id = this.currentUserId.toString();
    this.currentUserId++;
    const createdAt = new Date();
    const user: AppUser = { 
      ...userData, 
      id, 
      addresses: [], 
      fullName: userData.fullName || null,
      createdAt 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: string, userData: Partial<AppUser>): Promise<AppUser | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Product methods
  async getProducts(options?: { category?: string; subCategory?: string }): Promise<AppProduct[]> {
    let products = Array.from(this.products.values());
    
    if (options) {
      products = products.filter(product => {
        return Object.entries(options).every(([key, value]) => {
          if (value === undefined) return true;
          return product[key as keyof AppProduct] === value;
        });
      });
    }
    
    return products;
  }
  
  async getProduct(id: string): Promise<AppProduct | undefined> {
    return this.products.get(id);
  }
  
  async searchProducts(query: string): Promise<AppProduct[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product => 
        product.title.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  async getFeaturedProducts(): Promise<AppProduct[]> {
    return Array.from(this.products.values()).filter(product => product.featured);
  }
  
  async getNewArrivals(): Promise<AppProduct[]> {
    return Array.from(this.products.values()).filter(product => product.newArrival);
  }
  
  async getSaleProducts(): Promise<AppProduct[]> {
    return Array.from(this.products.values()).filter(product => product.onSale);
  }
  
  async createProduct(productData: schema.InsertProduct): Promise<AppProduct> {
    const id = this.currentProductId.toString();
    this.currentProductId++;
    const product: AppProduct = {
      id,
      title: productData.title,
      description: productData.description,
      price: productData.price,
      originalPrice: productData.originalPrice ?? null,
      category: productData.category,
      subCategory: productData.subCategory ?? null,
      images: productData.images ? [...productData.images] : [],
      sizes: productData.sizes ? [...productData.sizes] : [],
      colors: productData.colors ? [...productData.colors] : [],
      rating: 0,
      reviewCount: 0,
      featured: productData.featured ?? false,
      newArrival: productData.newArrival ?? false,
      onSale: productData.onSale ?? false,
      inventory: productData.inventory || 0
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: string, productData: Partial<AppProduct>): Promise<AppProduct | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Cart methods
  async getCart(userId: string): Promise<AppCart | undefined> {
    return this.carts.get(userId);
  }
  
  async getCartByUserId(userId: string): Promise<AppCart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }
  
  async createCart(cartData: schema.InsertCart): Promise<AppCart> {
    const id = this.currentCartId.toString();
    this.currentCartId++;
    const updatedAt = new Date();
    const cart: AppCart = {
      id,
      userId: cartData.userId.toString(),
      items: cartData.items ? [...cartData.items] : [],
      updatedAt
    };
    this.carts.set(id, cart);
    return cart;
  }
  
  async updateCart(userId: string, items: CartItem[]): Promise<AppCart> {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("Cart not found");
    const updatedCart = { ...cart, items };
    this.carts.set(userId, updatedCart);
    return updatedCart;
  }
  
  async deleteCart(id: string): Promise<boolean> {
    return this.carts.delete(id);
  }
  
  // Wishlist methods
  async getWishlist(userId: string): Promise<AppWishlist | undefined> {
    return this.wishlists.get(userId);
  }
  
  async getWishlistByUserId(userId: string): Promise<AppWishlist | undefined> {
    return Array.from(this.wishlists.values()).find(wishlist => wishlist.userId === userId);
  }
  
  async createWishlist(wishlistData: schema.InsertWishlist): Promise<AppWishlist> {
    const id = this.currentWishlistId.toString();
    this.currentWishlistId++;
    const updatedAt = new Date();
    const wishlist: AppWishlist = {
      id,
      userId: wishlistData.userId.toString(),
      productIds: Array.isArray(wishlistData.productIds) 
        ? wishlistData.productIds.map((productId: unknown) => String(productId))
        : [],
      updatedAt
    };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }
  
  async updateWishlist(userId: string, productIds: string[]): Promise<AppWishlist> {
    const wishlist = await this.getWishlist(userId);
    if (!wishlist) throw new Error("Wishlist not found");
    const updatedWishlist = { ...wishlist, productIds };
    this.wishlists.set(userId, updatedWishlist);
    return updatedWishlist;
  }
  
  async deleteWishlist(id: string): Promise<boolean> {
    return this.wishlists.delete(id);
  }
  
  // Order methods
  async getOrders(userId: string): Promise<AppOrder[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  }
  
  async getOrder(id: string): Promise<AppOrder | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(orderData: schema.InsertOrder): Promise<AppOrder> {
    const id = this.currentOrderId.toString();
    this.currentOrderId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const order: AppOrder = {
      id,
      userId: orderData.userId.toString(),
      items: orderData.items ? [...orderData.items] : [],
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      status: orderData.status || 'pending',
      createdAt,
      updatedAt
    };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: string, orderData: Partial<AppOrder>): Promise<AppOrder | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...orderData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }
  
  // Review methods
  async getReview(id: string): Promise<AppReview | undefined> {
    return this.reviews.get(id);
  }
  
  async getProductReviews(productId: string): Promise<AppReview[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  }
  
  async createReview(reviewData: schema.InsertReview): Promise<AppReview> {
    const id = this.currentReviewId.toString();
    this.currentReviewId++;
    const createdAt = new Date();
    const review: AppReview = {
      id,
      userId: reviewData.userId.toString(),
      productId: reviewData.productId.toString(),
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      createdAt
    };
    this.reviews.set(id, review);
    // Update product rating
    const product = await this.getProduct(reviewData.productId.toString());
    if (product) {
      const reviews = await this.getProductReviews(product.id);
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.round(totalRating / reviews.length);
      await this.updateProduct(product.id, {
        rating: averageRating,
        reviewCount: reviews.length
      });
    }
    return review;
  }
  
  async updateReview(id: string, reviewData: Partial<AppReview>): Promise<AppReview | undefined> {
    const review = await this.getReview(id);
    if (!review) return undefined;
    const updatedReview = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }
  
  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }
  
  // Helper method to seed initial products
  private seedProducts() {
    const products: schema.InsertProduct[] = [
      {
        title: "Soft Linen Blend Blazer",
        description: "A breathable linen-blend blazer with a relaxed silhouette. Features notched lapels, front button closure, and flap pockets. Perfect for both casual and semi-formal occasions.",
        price: 12900, // $129.00
        originalPrice: 18900, // $189.00
        category: "women",
        subCategory: "blazers",
        images: [
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&h=1000&q=80",
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&h=1000&q=80",
          "https://images.unsplash.com/photo-1583744946564-b52d01a7b257?auto=format&fit=crop&w=800&h=1000&q=80",
          "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&h=1000&q=80"
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Beige", code: "#E8E4DD" },
          { name: "Blue", code: "#BFD7ED" },
          { name: "Green", code: "#C2E0C9" }
        ],
        inventory: 50,
        featured: true,
        newArrival: false,
        onSale: true
      },
      {
        title: "Linen Blend Dress",
        description: "Perfect for summer occasions. Lightweight linen blend with a flattering silhouette.",
        price: 8900, // $89.00
        originalPrice: null,
        category: "women",
        subCategory: "dresses",
        images: [
          "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=500&h=650&q=80"
        ],
        sizes: ["XS", "S", "M", "L"],
        colors: [
          { name: "Beige", code: "#E8E4DD" },
          { name: "Blue", code: "#BFD7ED" }
        ],
        inventory: 30,
        featured: true,
        newArrival: true,
        onSale: false
      },
      {
        title: "Classic Beige Trousers",
        description: "High-waisted design with a modern cut. Made from premium cotton blend.",
        price: 7500, // $75.00
        originalPrice: null,
        category: "women",
        subCategory: "pants",
        images: [
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=500&h=650&q=80"
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [
          { name: "Beige", code: "#E8E4DD" },
          { name: "Black", code: "#333333" }
        ],
        inventory: 25,
        featured: false,
        newArrival: false,
        onSale: false
      },
      {
        title: "Structured Handbag",
        description: "Vegan leather finish with gold-tone hardware. Includes detachable shoulder strap.",
        price: 11900, // $119.00
        originalPrice: null,
        category: "accessories",
        subCategory: "bags",
        images: [
          "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=500&h=650&q=80"
        ],
        sizes: ["One Size"],
        colors: [
          { name: "Beige", code: "#E8E4DD" },
          { name: "Black", code: "#333333" }
        ],
        inventory: 15,
        featured: false,
        newArrival: true,
        onSale: false
      },
      {
        title: "Oversized Cotton Shirt",
        description: "Relaxed silhouette with dropped shoulders. Made from 100% organic cotton.",
        price: 5900, // $59.00
        originalPrice: 7500, // $75.00
        category: "women",
        subCategory: "shirts",
        images: [
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&h=650&q=80"
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: [
          { name: "White", code: "#FFFFFF" },
          { name: "Blue", code: "#BFD7ED" }
        ],
        inventory: 40,
        featured: false,
        newArrival: false,
        onSale: true
      },
      {
        title: "Slim Fit Jeans",
        description: "Medium wash denim with slight stretch for comfort. Classic five-pocket design.",
        price: 6900, // $69.00
        originalPrice: null,
        category: "men",
        subCategory: "jeans",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&h=650&q=80"
        ],
        sizes: ["30", "32", "34", "36"],
        colors: [
          { name: "Medium Blue", code: "#4A75BA" },
          { name: "Dark Blue", code: "#162955" }
        ],
        inventory: 35,
        featured: true,
        newArrival: false,
        onSale: false
      }
    ];
    
    // Add all products to storage
    products.forEach(product => {
      const id = this.currentProductId.toString();
      this.currentProductId++;
      const fullProduct: AppProduct = {
        id,
        title: product.title,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        category: product.category,
        subCategory: product.subCategory ?? null,
        images: [...(product.images || [])],
        sizes: [...(product.sizes || [])],
        colors: [...(product.colors || [])],
        rating: 0,
        reviewCount: 0,
        featured: product.featured ?? false,
        newArrival: product.newArrival ?? false,
        onSale: product.onSale ?? false,
        inventory: product.inventory || 0
      };
      this.products.set(id, fullProduct);
    });
  }
}

// Two storage options - MongoDB when available, in-memory as fallback
// We'll decide which one to use in runtime based on MongoDB connection status

// Create an instance of the in-memory storage for fallback
const memStorage = new MemStorage();

// Export the default storage
// This still uses in-memory storage initially, but gets replaced at runtime
export let storage: IStorage = memStorage;

// Function to switch to MongoStorage if MongoDB is available
export function useMongoStorage(mongoStorage: IStorage) {
  storage = mongoStorage;
}
