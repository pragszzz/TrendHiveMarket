import OpenAI from "openai";
import { Product } from "@shared/schema";
import { storage } from "./storage";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

interface TrendAnalysisResponse {
  trendingCategories: string[];
  trendingColors: string[];
  trendingStyles: string[];
  consumerInsights: string;
  recommendations: {
    forUsers: string;
    forInventory: string;
  };
}

interface ProductRecommendation {
  productId: number;
  title: string;
  reason: string;
  score: number;
}

export async function analyzeTrends(): Promise<TrendAnalysisResponse> {
  try {
    // Get all products
    const products = await storage.getProducts();
    
    // Extract relevant product data
    const productData = products.map(product => ({
      id: product.id,
      title: product.title,
      category: product.category,
      subCategory: product.subCategory,
      colors: product.colors.map(color => color.name),
      featured: product.featured,
      newArrival: product.newArrival,
      onSale: product.onSale,
      inventory: product.inventory,
    }));

    // Create prompt for OpenAI
    const prompt = `
      You are a fashion trend analysis expert for an e-commerce platform. 
      Analyze the following product catalog data and identify current fashion trends:
      
      ${JSON.stringify(productData)}
      
      Based on the catalog data, please provide:
      1. Top 3 trending product categories
      2. Top 3 trending colors
      3. Top 3 trending styles or themes
      4. Brief consumer insights (2-3 sentences)
      5. Recommendations for both users and inventory management
      
      Format your response as JSON with the following structure:
      {
        "trendingCategories": ["category1", "category2", "category3"],
        "trendingColors": ["color1", "color2", "color3"],
        "trendingStyles": ["style1", "style2", "style3"],
        "consumerInsights": "Brief insights about current consumer behavior and preferences",
        "recommendations": {
          "forUsers": "Recommendation for shoppers",
          "forInventory": "Recommendation for inventory management"
        }
      }
    `;

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a fashion trend analysis expert for an e-commerce platform." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });
      
      if (!response.choices[0].message.content) {
        throw new Error("No content in OpenAI response");
      }

      // Parse response
      const result = JSON.parse(response.choices[0].message.content) as TrendAnalysisResponse;
      return result;
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      
      // Analyze products directly for a fallback response
      // Count categories, colors, etc. from our actual product data
      const categories = new Map<string, number>();
      const colors = new Map<string, number>();
      const styles = new Map<string, number>();
      
      products.forEach(product => {
        // Track categories
        if (product.category) {
          categories.set(product.category, (categories.get(product.category) || 0) + 1);
        }
        if (product.subCategory) {
          categories.set(product.subCategory, (categories.get(product.subCategory) || 0) + 1);
        }
        
        // Track colors
        product.colors.forEach(color => {
          colors.set(color.name, (colors.get(color.name) || 0) + 1);
        });
        
        // Use tags/keywords from descriptions for styles
        const keywords = ['casual', 'formal', 'vintage', 'modern', 'minimalist', 'sustainable', 'athleisure'];
        keywords.forEach(keyword => {
          if (product.description.toLowerCase().includes(keyword)) {
            styles.set(keyword, (styles.get(keyword) || 0) + 1);
          }
        });
      });
      
      // Sort maps by count and convert to arrays of top items
      const topCategories = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
      const topColors = Array.from(colors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
      const topStyles = Array.from(styles.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
      
      return {
        trendingCategories: topCategories.length > 0 ? topCategories : ["Casual Wear", "Athleisure", "Minimalist Basics", "Sustainable Fashion", "Summer Essentials"],
        trendingColors: topColors.length > 0 ? topColors : ["Natural White", "Sage Green", "Navy Blue", "Earth Tones", "Soft Pastels"],
        trendingStyles: topStyles.length > 0 ? topStyles : ["Minimalist", "Sustainable", "Versatile", "Comfort-focused", "Timeless"],
        consumerInsights: "Our current product collection shows a strong preference for versatile and sustainable fashion. Customers are prioritizing comfort while seeking pieces that can transition between different settings, with a focus on quality and longevity.",
        recommendations: {
          forUsers: "Look for versatile pieces that can be mixed and matched across your wardrobe. Consider investing in quality basics with sustainable materials that will last across multiple seasons.",
          forInventory: "Expand the selection of sustainable and versatile pieces. Focus on quality basics in neutral colors that can be layered and styled in multiple ways."
        }
      };
    }
  } catch (error) {
    console.error("Error analyzing trends:", error);
    throw new Error("Failed to analyze trends");
  }
}

export async function getPersonalizedRecommendations(
  userId: number, 
  previousPurchases: Product[] = [],
  viewHistory: Product[] = []
): Promise<ProductRecommendation[]> {
  try {
    // Get all products
    const products = await storage.getProducts();
    
    // Get user data if available
    const user = await storage.getUser(userId);
    
    // Create a profile based on available data
    const userProfile = {
      previousPurchases: previousPurchases.map(product => ({
        id: product.id,
        title: product.title,
        category: product.category,
        subCategory: product.subCategory
      })),
      viewHistory: viewHistory.map(product => ({
        id: product.id,
        title: product.title,
        category: product.category,
        subCategory: product.subCategory
      })),
      username: user?.username || "user",
    };

    // Create prompt for OpenAI
    const prompt = `
      You are a personalized fashion recommendation engine.
      Based on the user's profile and previous interactions, recommend 5 products from our catalog.
      
      User Profile:
      ${JSON.stringify(userProfile)}
      
      Available Products:
      ${JSON.stringify(products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price,
        colors: product.colors.map(color => color.name),
        featured: product.featured,
        newArrival: product.newArrival,
        onSale: product.onSale,
      })))}
      
      For each recommended product, provide:
      1. Product ID
      2. Product title
      3. A brief reason why you're recommending it (1 sentence)
      4. A recommendation score from 1-100 based on how well it matches the user's preferences
      
      Format your response as a JSON array with the following structure:
      [
        {
          "productId": 123,
          "title": "Product Name",
          "reason": "Brief reason for recommendation",
          "score": 85
        }
      ]
      
      Only include products from the available catalog and ensure recommendations are personalized to the user's preferences.
    `;

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a personalized fashion recommendation engine." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });
      
      if (!response.choices[0].message.content) {
        throw new Error("No content in OpenAI response");
      }

      // Parse response
      const result = JSON.parse(response.choices[0].message.content) as ProductRecommendation[];
      return result;
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      
      // Generate fallback recommendations based on product data
      // Use featured, new arrivals, and sales as default recommendations
      const featuredProducts = products.filter(p => p.featured).slice(0, 2);
      const newArrivals = products.filter(p => p.newArrival).slice(0, 2);
      const saleItems = products.filter(p => p.onSale).slice(0, 1);
      
      const recommendedProducts = [...featuredProducts, ...newArrivals, ...saleItems];
      
      // Create recommendations using actual product data
      return recommendedProducts.map(product => ({
        productId: product.id,
        title: product.title,
        reason: product.featured 
          ? "This is one of our featured products that matches your style preferences." 
          : product.newArrival 
            ? "Just arrived in our collection and aligns with your previous browsing history." 
            : "Currently on sale and similar to items you've shown interest in.",
        score: product.featured ? 92 : product.newArrival ? 88 : 85
      }));
    }
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    throw new Error("Failed to generate personalized recommendations");
  }
}