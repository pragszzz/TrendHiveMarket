import mongoose from 'mongoose';
import { log } from './vite';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendhive';

console.log("Connecting to MongoDB with URI:", MONGODB_URI);

export async function connectToMongoDB() {
  try {
    // Set mongoose connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Try to connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);
    log('Connected to MongoDB successfully', 'mongodb');

    // Test the connection by querying products
    try {
      const products = await mongoose.model('Product').find({}).limit(1);
      log(`Database connection test: Found ${products.length} products`, 'mongodb');
    } catch (queryError) {
      log(`Database query test failed: ${queryError}`, 'mongodb');
      return false;
    }

    return true;
  } catch (error) {
    // Provide more detailed error information
    log(`MongoDB Connection Error: ${error}`, 'mongodb');
    if (error.name === 'MongoServerSelectionError') {
      log('Could not connect to MongoDB server. Please check if MongoDB is running.', 'mongodb');
    } else if (error.name === 'MongoNetworkError') {
      log('Network error occurred while connecting to MongoDB.', 'mongodb');
    }
    log('Falling back to in-memory storage.', 'mongodb');
    return false;
  }
}

// MongoDB Models
// User Model
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  fullName: String,
  addresses: [{
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Product Model
const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  originalPrice: {
    type: Number,
    default: null
  },
  category: String,
  subCategory: String,
  colors: [{
    name: String,
    code: String
  }],
  sizes: [String],
  images: [String],
  featured: { 
    type: Boolean, 
    default: false 
  },
  newArrival: { 
    type: Boolean, 
    default: false 
  },
  onSale: { 
    type: Boolean, 
    default: false 
  },
  inventory: { 
    type: Number, 
    default: 0 
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { collection: 'products' });

// Cart Model
const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  size: String,
  color: String
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [cartItemSchema],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Wishlist Model
const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  productIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Order Model
const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  size: String,
  color: String,
  price: { 
    type: Number, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Review Model
const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Review = mongoose.model('Review', reviewSchema);