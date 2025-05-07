import { User, Product, Cart, Wishlist, Order, Review } from "./mongo";
import { log } from "./vite";
import * as schema from "../shared/schema";
import type { AppUser, AppProduct, AppCart, AppWishlist, AppOrder, AppReview } from "../shared/schema";
import MongoStore from "connect-mongo";
import type { IStorage } from "./storage";
import mongoose from "mongoose";

export class MongoStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MongoStore({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/trendhive',
      collectionName: 'sessions'
    });
  }

  // User methods
  async getUser(id: string): Promise<AppUser | undefined> {
    try {
      const user = await User.findById(id);
      if (!user) return undefined;
      return this.mapMongoUserToSchema(user);
    } catch (error) {
      log(`Error fetching user by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<AppUser | undefined> {
    try {
      const user = await User.findOne({ username });
      if (!user) return undefined;
      return this.mapMongoUserToSchema(user);
    } catch (error) {
      log(`Error fetching user by username: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<AppUser | undefined> {
    try {
      const user = await User.findOne({ email });
      if (!user) return undefined;
      return this.mapMongoUserToSchema(user);
    } catch (error) {
      log(`Error fetching user by email: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async createUser(userData: schema.InsertUser): Promise<AppUser> {
    try {
      const user = new User(userData);
      await user.save();
      return this.mapMongoUserToSchema(user);
    } catch (error) {
      log(`Error creating user: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<AppUser>): Promise<AppUser | undefined> {
    try {
      const user = await User.findByIdAndUpdate(id, userData, { new: true });
      if (!user) return undefined;
      return this.mapMongoUserToSchema(user);
    } catch (error) {
      log(`Error updating user: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting user: ${error}`, 'mongodb');
      return false;
    }
  }

  // Product methods
  async getProducts(filters?: Partial<AppProduct>): Promise<AppProduct[]> {
    try {
      let query: any = {};
      if (filters) {
        if (filters.category) {
          // Use case-insensitive regex for category
          query.category = { $regex: `^${filters.category}$`, $options: 'i' };
        }
        if (filters.subCategory) {
          query.subCategory = { $regex: `^${filters.subCategory}$`, $options: 'i' };
        }
      }
      const products = await Product.find(Object.keys(query).length ? query : {});
      return products.map(this.mapMongoProductToSchema);
    } catch (error) {
      log(`Error fetching products: ${error}`, 'mongodb');
      return [];
    }
  }

  async getProduct(id: string): Promise<AppProduct | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // Not a valid ObjectId, return undefined early
        return undefined;
      }
      const objectId = new mongoose.Types.ObjectId(id);
      const product = await Product.findById(objectId);
      if (!product) return undefined;
      return this.mapMongoProductToSchema(product);
    } catch (error) {
      log(`Error fetching product by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async searchProducts(query: string): Promise<AppProduct[]> {
    try {
      const products = await Product.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      return products.map(this.mapMongoProductToSchema);
    } catch (error) {
      log(`Error searching products: ${error}`, 'mongodb');
      return [];
    }
  }

  async getFeaturedProducts(): Promise<AppProduct[]> {
    try {
      const products = await Product.find({ featured: true });
      return products.map(this.mapMongoProductToSchema);
    } catch (error) {
      log(`Error fetching featured products: ${error}`, 'mongodb');
      return [];
    }
  }

  async getNewArrivals(): Promise<AppProduct[]> {
    try {
      const products = await Product.find({ newArrival: true });
      return products.map(this.mapMongoProductToSchema);
    } catch (error) {
      log(`Error fetching new arrivals: ${error}`, 'mongodb');
      return [];
    }
  }

  async getSaleProducts(): Promise<AppProduct[]> {
    try {
      const products = await Product.find({ onSale: true });
      return products.map(this.mapMongoProductToSchema);
    } catch (error) {
      log(`Error fetching sale products: ${error}`, 'mongodb');
      return [];
    }
  }

  async createProduct(productData: schema.InsertProduct): Promise<AppProduct> {
    try {
      const product = new Product(productData);
      await product.save();
      return this.mapMongoProductToSchema(product);
    } catch (error) {
      log(`Error creating product: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<AppProduct>): Promise<AppProduct | undefined> {
    try {
      const product = await Product.findByIdAndUpdate(id, productData, { new: true });
      if (!product) return undefined;
      return this.mapMongoProductToSchema(product);
    } catch (error) {
      log(`Error updating product: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting product: ${error}`, 'mongodb');
      return false;
    }
  }

  // Cart methods
  async getCart(id: string): Promise<AppCart | undefined> {
    try {
      const cart = await Cart.findById(id);
      if (!cart) return undefined;
      return this.mapMongoCartToSchema(cart);
    } catch (error) {
      log(`Error fetching cart by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getCartByUserId(userId: string): Promise<AppCart | undefined> {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) return undefined;
      return this.mapMongoCartToSchema(cart);
    } catch (error) {
      log(`Error fetching cart by user ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async createCart(cartData: schema.InsertCart): Promise<AppCart> {
    try {
      const cart = new Cart(cartData);
      await cart.save();
      return this.mapMongoCartToSchema(cart);
    } catch (error) {
      log(`Error creating cart: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateCart(id: string, cartData: Partial<AppCart>): Promise<AppCart | undefined> {
    try {
      const cart = await Cart.findByIdAndUpdate(
        id,
        { $set: cartData },
        { new: true }
      );
      if (!cart) return undefined;
      return this.mapMongoCartToSchema(cart);
    } catch (error) {
      log(`Error updating cart: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteCart(id: string): Promise<boolean> {
    try {
      const result = await Cart.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting cart: ${error}`, 'mongodb');
      return false;
    }
  }

  // Wishlist methods
  async getWishlist(id: string): Promise<AppWishlist | undefined> {
    try {
      const wishlist = await Wishlist.findById(id);
      if (!wishlist) return undefined;
      return this.mapMongoWishlistToSchema(wishlist);
    } catch (error) {
      log(`Error fetching wishlist by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getWishlistByUserId(userId: string): Promise<AppWishlist | undefined> {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) return undefined;
      return this.mapMongoWishlistToSchema(wishlist);
    } catch (error) {
      log(`Error fetching wishlist by user ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async createWishlist(wishlistData: schema.InsertWishlist): Promise<AppWishlist> {
    try {
      const wishlist = new Wishlist(wishlistData);
      await wishlist.save();
      return this.mapMongoWishlistToSchema(wishlist);
    } catch (error) {
      log(`Error creating wishlist: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateWishlist(id: string, wishlistData: Partial<AppWishlist>): Promise<AppWishlist | undefined> {
    try {
      const wishlist = await Wishlist.findByIdAndUpdate(
        id,
        { $set: wishlistData },
        { new: true }
      );
      if (!wishlist) return undefined;
      return this.mapMongoWishlistToSchema(wishlist);
    } catch (error) {
      log(`Error updating wishlist: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteWishlist(id: string): Promise<boolean> {
    try {
      const result = await Wishlist.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting wishlist: ${error}`, 'mongodb');
      return false;
    }
  }

  // Order methods
  async getOrder(id: string): Promise<AppOrder | undefined> {
    try {
      const order = await Order.findById(id);
      if (!order) return undefined;
      return this.mapMongoOrderToSchema(order);
    } catch (error) {
      log(`Error fetching order by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getOrdersByUserId(userId: string): Promise<AppOrder[]> {
    try {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      return orders.map(this.mapMongoOrderToSchema);
    } catch (error) {
      log(`Error fetching orders by user ID: ${error}`, 'mongodb');
      return [];
    }
  }

  async createOrder(orderData: schema.InsertOrder): Promise<AppOrder> {
    try {
      const order = new Order(orderData);
      await order.save();
      return this.mapMongoOrderToSchema(order);
    } catch (error) {
      log(`Error creating order: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateOrder(id: string, orderData: Partial<AppOrder>): Promise<AppOrder | undefined> {
    try {
      const order = await Order.findByIdAndUpdate(id, orderData, { new: true });
      if (!order) return undefined;
      return this.mapMongoOrderToSchema(order);
    } catch (error) {
      log(`Error updating order: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const result = await Order.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting order: ${error}`, 'mongodb');
      return false;
    }
  }

  // Review methods
  async getReview(id: string): Promise<AppReview | undefined> {
    try {
      const review = await Review.findById(id);
      if (!review) return undefined;
      return this.mapMongoReviewToSchema(review);
    } catch (error) {
      log(`Error fetching review by ID: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async getProductReviews(productId: string): Promise<AppReview[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return [];
      }
      const objectId = new mongoose.Types.ObjectId(productId);
      const reviews = await Review.find({ productId: objectId });
      return reviews.map(review => this.mapMongoReviewToSchema(review));
    } catch (error) {
      log(`Error fetching product reviews: ${error}`, 'mongodb');
      return [];
    }
  }

  async createReview(reviewData: schema.InsertReview): Promise<AppReview> {
    try {
      const review = new Review(reviewData);
      await review.save();
      return this.mapMongoReviewToSchema(review);
    } catch (error) {
      log(`Error creating review: ${error}`, 'mongodb');
      throw error;
    }
  }

  async updateReview(id: string, reviewData: Partial<AppReview>): Promise<AppReview | undefined> {
    try {
      const review = await Review.findByIdAndUpdate(id, reviewData, { new: true });
      if (!review) return undefined;
      return this.mapMongoReviewToSchema(review);
    } catch (error) {
      log(`Error updating review: ${error}`, 'mongodb');
      return undefined;
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      const result = await Review.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      log(`Error deleting review: ${error}`, 'mongodb');
      return false;
    }
  }

  // Mapping methods
  private mapMongoUserToSchema(user: any): AppUser {
    return {
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      email: user.email,
      fullName: user.fullName || null,
      addresses: user.addresses || [],
      createdAt: user.createdAt
    };
  }

  private mapMongoProductToSchema(product: any): AppProduct {
    if (!product) {
      throw new Error('Cannot map undefined or null product');
    }

    try {
      return {
        id: product._id.toString(),
        title: product.title || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        category: product.category || '',
        subCategory: product.subCategory || null,
        images: Array.isArray(product.images) ? [...product.images] : [],
        sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
        colors: Array.isArray(product.colors) ? [...product.colors] : [],
        rating: Number(product.rating) || 0,
        reviewCount: Number(product.reviewCount) || 0,
        featured: Boolean(product.featured),
        newArrival: Boolean(product.newArrival),
        onSale: Boolean(product.onSale),
        inventory: Number(product.inventory) || 0
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      log(`Error mapping product: ${error}`, 'mongodb');
      throw new Error(`Failed to map product with ID ${product._id}: ${error}`);
    }
  }

  private mapMongoCartToSchema(cart: any): AppCart {
    if (!cart) {
      throw new Error('Cannot map undefined or null cart');
    }

    try {
      return {
        id: cart._id.toString(),
        userId: cart.userId.toString(),
        items: Array.isArray(cart.items) ? cart.items.map((item: any) => ({
          productId: item.productId.toString(),
          quantity: Number(item.quantity) || 1,
          size: item.size || null,
          color: item.color || null
        })) : [],
        updatedAt: new Date(cart.updatedAt)
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      log(`Error mapping cart: ${error}`, 'mongodb');
      throw new Error(`Failed to map cart with ID ${cart._id}: ${error}`);
    }
  }

  private mapMongoWishlistToSchema(wishlist: any): AppWishlist {
    if (!wishlist) {
      throw new Error('Cannot map undefined or null wishlist');
    }

    try {
      return {
        id: wishlist._id.toString(),
        userId: wishlist.userId.toString(),
        productIds: Array.isArray(wishlist.productIds) 
          ? wishlist.productIds.map((id: any) => id.toString())
          : [],
        updatedAt: new Date(wishlist.updatedAt)
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      log(`Error mapping wishlist: ${error}`, 'mongodb');
      throw new Error(`Failed to map wishlist with ID ${wishlist._id}: ${error}`);
    }
  }

  private mapMongoOrderToSchema(order: any): AppOrder {
    return {
      id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  private mapMongoReviewToSchema(review: any): AppReview {
    return {
      id: review._id.toString(),
      userId: review.userId.toString(),
      productId: review.productId.toString(),
      rating: review.rating,
      comment: review.comment || null,
      createdAt: review.createdAt
    };
  }
}

// Create and export an instance of MongoStorage
export const mongoStorage = new MongoStorage();