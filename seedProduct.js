// seedProducts.js
import mongoose from 'mongoose';

const uri = 'mongodb://localhost:27017/trendhive';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  subCategory: String,
  images: [String],
  sizes: [String],
  colors: [{ name: String, code: String }],
  inventory: Number,
  featured: Boolean,
  newArrival: Boolean,
  onSale: Boolean,
  rating: Number,
  reviewCount: Number,
});

const Product = mongoose.model('Product', productSchema);

const products = [
  {
    title: "Oversized Cotton Shirt",
    description: "Relaxed silhouette with dropped shoulders. Made from 100% organic cotton.",
    price: 5900,
    originalPrice: 7500,
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
    onSale: true,
    rating: 0,
    reviewCount: 0
  },
  {
    title: "Slim Fit Jeans",
    description: "Medium wash denim with slight stretch for comfort. Classic five-pocket design.",
    price: 6900,
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
    onSale: false,
    rating: 0,
    reviewCount: 0
  },
  {
    title: "Linen Blazer",
    description: "Lightweight linen blazer, perfect for summer evenings.",
    price: 12900,
    originalPrice: 14900,
    category: "women",
    subCategory: "blazers",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&h=650&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Beige", code: "#F5F5DC" }
    ],
    inventory: 20,
    featured: true,
    newArrival: true,
    onSale: true,
    rating: 0,
    reviewCount: 0
  },
  {
    title: "Classic Handbag",
    description: "Elegant and spacious, made from vegan leather.",
    price: 8500,
    originalPrice: 9500,
    category: "women",
    subCategory: "bags",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&h=650&q=80"
    ],
    sizes: [],
    colors: [
      { name: "Black", code: "#000000" },
      { name: "Tan", code: "#D2B48C" }
    ],
    inventory: 15,
    featured: false,
    newArrival: true,
    onSale: true,
    rating: 0,
    reviewCount: 0
  },
  {
    title: "Cotton Trousers",
    description: "Comfortable cotton trousers for everyday wear.",
    price: 4900,
    originalPrice: 5900,
    category: "men",
    subCategory: "trousers",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=500&h=650&q=80"
    ],
    sizes: ["30", "32", "34", "36"],
    colors: [
      { name: "Khaki", code: "#C3B091" }
    ],
    inventory: 25,
    featured: false,
    newArrival: false,
    onSale: true,
    rating: 0,
    reviewCount: 0
  },
  {
    title: "Summer Dress",
    description: "Floral print summer dress with a relaxed fit.",
    price: 7900,
    originalPrice: 9900,
    category: "women",
    subCategory: "dresses",
    images: [
      "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=500&h=650&q=80"
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Floral", code: "#FFB6C1" }
    ],
    inventory: 30,
    featured: true,
    newArrival: true,
    onSale: true,
    rating: 0,
    reviewCount: 0
  }
];

(async () => {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Clearing old products...");
  await Product.deleteMany({});
  console.log("Seeding products...");
  await Product.insertMany(products);
  console.log("Products seeded!");
  mongoose.connection.close();
})();