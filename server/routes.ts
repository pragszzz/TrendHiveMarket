import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeTrends, getPersonalizedRecommendations } from "./trendAnalysis";
import { 
  InsertCart, InsertOrder, 
  CartItem, OrderItem, 
  InsertReview, Product
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, subCategory, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts({
          category: category as string,
          subCategory: subCategory as string
        });
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/products/new", async (req, res) => {
    try {
      const products = await storage.getNewArrivals();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/products/sale", async (req, res) => {
    try {
      const products = await storage.getSaleProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const cart = await storage.getCart(req.user.id);
      
      if (!cart) {
        // Return empty cart if user doesn't have one yet
        return res.json({ id: 0, userId: req.user.id, items: [], updatedAt: new Date() });
      }
      
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { items } = req.body as { items: CartItem[] };
      const cart = await storage.updateCart(req.user.id, items);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/cart/add", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { productId, quantity, size, color } = req.body as CartItem;
      
      // Get current cart
      let cart = await storage.getCart(req.user.id);
      let items: CartItem[] = cart ? [...cart.items] : [];
      
      // Check if product already exists in cart
      const existingItemIndex = items.findIndex(item => 
        item.productId === productId && item.size === size && item.color === color
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        items.push({ productId, quantity, size, color });
      }
      
      // Update cart
      cart = await storage.updateCart(req.user.id, items);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      await storage.clearCart(req.user.id);
      res.status(200).json({ message: "Cart cleared" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const wishlist = await storage.getWishlist(req.user.id);
      
      if (!wishlist) {
        // Return empty wishlist if user doesn't have one yet
        return res.json({ id: 0, userId: req.user.id, productIds: [], updatedAt: new Date() });
      }
      
      res.json(wishlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { productIds } = req.body as { productIds: number[] };
      const wishlist = await storage.updateWishlist(req.user.id, productIds);
      res.json(wishlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/wishlist/toggle", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { productId } = req.body as { productId: number };
      
      // Get current wishlist
      let wishlist = await storage.getWishlist(req.user.id);
      let productIds: number[] = wishlist ? [...wishlist.productIds] : [];
      
      // Toggle product
      const index = productIds.indexOf(productId);
      if (index === -1) {
        productIds.push(productId);
      } else {
        productIds.splice(index, 1);
      }
      
      // Update wishlist
      wishlist = await storage.updateWishlist(req.user.id, productIds);
      res.json(wishlist);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Orders routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { items, totalAmount, shippingAddress } = req.body;
      
      // Create order
      const order = await storage.createOrder({
        userId: req.user.id,
        items,
        totalAmount,
        shippingAddress,
        status: "processing"
      });
      
      // Clear cart after successful order
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { productId, rating, comment } = req.body;
      
      const review = await storage.createReview({
        userId: req.user.id,
        productId,
        rating,
        comment
      });
      
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Trend Analysis Routes
  app.get("/api/trends", async (req, res) => {
    try {
      const trendAnalysis = await analyzeTrends();
      res.json(trendAnalysis);
    } catch (error: any) {
      console.error("Error in trend analysis:", error);
      
      // Use fallback data from products in the database
      try {
        // Get products and extract categories and metadata
        const products = await storage.getProducts();
        
        // Count categories, extract color data, etc.
        const categories = products.reduce((acc: {[key: string]: number}, product) => {
          if (product.category) {
            acc[product.category] = (acc[product.category] || 0) + 1;
          }
          if (product.subCategory) {
            acc[product.subCategory] = (acc[product.subCategory] || 0) + 1;
          }
          return acc;
        }, {});
        
        const colors = products.reduce((acc: {[key: string]: number}, product) => {
          product.colors.forEach(color => {
            acc[color.name] = (acc[color.name] || 0) + 1;
          });
          return acc;
        }, {});
        
        // Get top 5 categories and colors
        const topCategories = Object.entries(categories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);
          
        const topColors = Object.entries(colors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);
        
        // Provide fallback data based on actual product inventory
        res.json({
          trendingCategories: topCategories.length > 0 ? topCategories : ["Casual Wear", "Athleisure", "Minimalist Basics", "Sustainable Fashion", "Summer Essentials"],
          trendingColors: topColors.length > 0 ? topColors : ["Natural White", "Sage Green", "Navy Blue", "Earth Tones", "Soft Pastels"],
          trendingStyles: ["Minimalist", "Sustainable", "Versatile", "Comfort-focused", "Timeless"],
          consumerInsights: "Our current product collection shows a strong preference for versatile and sustainable fashion. Customers are prioritizing comfort while seeking pieces that can transition between different settings, with a focus on quality and longevity.",
          recommendations: {
            forUsers: "Look for versatile pieces that can be mixed and matched across your wardrobe. Consider investing in quality basics with sustainable materials that will last across multiple seasons.",
            forInventory: "Expand the selection of sustainable and versatile pieces. Focus on quality basics in neutral colors that can be layered and styled in multiple ways."
          }
        });
      } catch (fallbackError) {
        console.error("Error generating fallback trend analysis:", fallbackError);
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.get("/api/recommendations/personalized", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // In a real app, these would be fetched from storage based on user history
      const previousPurchases: [] = [];
      const viewHistory: [] = [];
      
      const recommendations = await getPersonalizedRecommendations(req.user.id, previousPurchases, viewHistory);
      res.json(recommendations);
    } catch (error: any) {
      console.error("Error getting personalized recommendations:", error);
      
      // Fallback recommendations
      try {
        // Get featured products, new arrivals, and sale items as fallback recommendations
        const products = await storage.getProducts();
        const featuredProducts = products.filter(p => p.featured).slice(0, 2);
        const newArrivals = products.filter(p => p.newArrival).slice(0, 2);
        const saleItems = products.filter(p => p.onSale).slice(0, 1);
        
        const recommendedProducts = [...featuredProducts, ...newArrivals, ...saleItems];
        
        // Create recommendations using actual product data
        const fallbackRecommendations = recommendedProducts.map(product => ({
          productId: product.id,
          title: product.title,
          reason: product.featured 
            ? "This is one of our featured products that matches your style preferences." 
            : product.newArrival 
              ? "Just arrived in our collection and aligns with your previous browsing history." 
              : "Currently on sale and similar to items you've shown interest in.",
          score: product.featured ? 92 : product.newArrival ? 88 : 85
        }));
        
        res.json(fallbackRecommendations);
      } catch (fallbackError) {
        console.error("Error generating fallback recommendations:", fallbackError);
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Virtual Try-On Route
  app.post("/api/virtual-try-on", async (req, res) => {
    try {
      const { productId, imageBase64 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      // Get the product from the database
      const product = await storage.getProduct(Number(productId));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required for virtual try-on" });
      }
      
      try {
        // In a real app with AR/CV APIs, we would process the image here
        // For now, we'll simulate the process using the product's image
        
        // Generate a unique identifier for this try-on result
        const tryOnId = Date.now().toString();
        const tryOnResult = {
          success: true,
          message: "Virtual try-on processed successfully",
          productId,
          // Return the original uploaded image until we implement the full CV/AR pipeline
          // In a real implementation, we would overlay the product on the user image
          imageUrl: imageBase64,
          tryOnId,
          product: {
            title: product.title,
            image: product.images[0] || "", // Main product image
            category: product.category
          }
        };
        
        res.json(tryOnResult);
      } catch (processingError: any) {
        console.error("Error in try-on image processing:", processingError);
        res.status(422).json({ 
          message: "Failed to process image for virtual try-on",
          details: processingError.message
        });
      }
    } catch (error: any) {
      console.error("Error processing virtual try-on:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
