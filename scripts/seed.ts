import bcrypt from "bcryptjs";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

// Load environment variables from .env.local
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value.replace(/^["']|["']$/g, ""); // Remove quotes
      }
    });
  }
};

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import Models
// We rely on ts-node/tsx to handle imports.
// If relative imports fail due to module resolution, we might need to define schemas inline or use require.
// But standard imports should work with tsx.

import { OrderStatus } from "@/lib/enums/order-status";
import { PaymentMethod } from "@/lib/enums/payment-method";
import { PaymentStatus } from "@/lib/enums/payment-status";
import Lead from "../models/Lead";
import FAQ from "../models/FAQ";
import Order from "../models/Order";
import Page from "../models/Page";
import Product from "../models/Product";
import SiteSettings from "../models/SiteSettings";
import Testimonial from "../models/Testimonial";
import User from "../models/User";

const seed = async () => {
  await connectDB();

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Testimonial.deleteMany({});
    await FAQ.deleteMany({});
    await Page.deleteMany({});
    await SiteSettings.deleteMany({});
    await Lead.deleteMany({});

    console.log("Seeding Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await User.create({
      name: "Admin User",
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      phone: "123-456-7890",
      address: "123 Admin St, Admin City, AS 12345",
      status: "active",
    });

    const customerUser = await User.create({
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: hashedPassword,
      role: "user",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      phone: "987-654-3210",
      address: "456 User Ln, User Town, US 67890",
      status: "active",
    });

    const products = await Product.create([
      {
        name: "LuxeAudio X1",
        description:
          "Premium noise-cancelling headphones with 40h battery life and crystal clear sound.",
        price: 299,

        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        ],
        features: ["Bluetooth 5.3", "Active Noise Cancellation", "40h Battery"],
        stock: 100,
        status: "active",
        tagline: "Experience Silence",
        socialProof: {
          noun: "audiophiles",
          count: 5000,
          rating: 4.9,
          avatars: [],
        },
      },
      {
        name: "LuxeAudio Pro Earbuds",
        description:
          "True wireless earbuds with immersive sound and IPX7 water resistance.",
        price: 149,

        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop",
        ],
        features: ["Wireless Charging", "IPX7 Waterproof", "24h Battery"],
        stock: 50,
        status: "active",
        tagline: "Sound Freedom",
      },
      {
        name: "LuxeAudio Home Speaker",
        description:
          "Smart home speaker with 360-degree sound and voice assistant support.",
        price: 199,

        images: [
          "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1000&auto=format&fit=crop",
        ],
        features: ["360 Sound", "Voice Assistant", "Multi-room Audio"],
        stock: 30,
        status: "active",
        tagline: "Fill the Room",
      },
    ]);

    console.log("Seeding Orders...");
    // Order model requires single product per order
    await Order.create([
      {
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        customerPhone: customerUser.phone || "N/A",
        address: customerUser.address || "N/A",
        productId: products[0]._id,
        quantity: 1,
        totalAmount: products[0].price,
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.SSLCOMMERZ,
        transactionId: "TXN123456789",
      },
      {
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        customerPhone: customerUser.phone || "N/A",
        address: customerUser.address || "N/A",
        productId: products[1]._id,
        quantity: 2,
        totalAmount: products[1].price * 2,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
      },
    ]);

    console.log("Seeding Testimonials...");
    await Testimonial.create([
      {
        author: "Sarah Jenkins",
        role: "Music Producer",
        content:
          "The sound quality of the X1 headphones is absolutely phenomenal. I use them for mixing and casual listening.",
        rating: 5,
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        status: "active",
      },
      {
        author: "Mike Ross",
        role: "Audiophile",
        content:
          "Best purchase I made this year. The noise cancellation is top-tier.",
        rating: 5,
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        status: "active",
      },
    ]);

    console.log("Seeding FAQs...");
    await FAQ.create([
      {
        question: "What is the warranty policy?",
        answer:
          "We offer a 2-year warranty on all our products covering manufacturing defects.",
        category: "Warranty",
        order: 1,
        status: "active",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to over 50 countries worldwide. Shipping times vary by location.",
        category: "Shipping",
        order: 2,
        status: "active",
      },
      {
        question: "What is the return policy?",
        answer:
          "You can return any product within 30 days of purchase for a full refund.",
        category: "Returns",
        order: 3,
        status: "active",
      },
    ]);

    console.log("Seeding Pages...");
    await Page.create([
      {
        title: "About Us",
        slug: "about",
        content:
          "<h1>About LuxeAudio</h1><p>We are passionate about delivering the best audio experience.</p>",
        status: "published",
        contentType: "html",
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        content:
          "<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>",
        status: "published",
        contentType: "html",
      },
      {
        title: "Terms of Service",
        slug: "terms",
        content:
          "<h1>Terms of Service</h1><p>Please read these terms carefully.</p>",
        status: "published",
        contentType: "html",
      },
    ]);

    console.log("Seeding Site Settings...");
    await SiteSettings.create({
      brandName: "LuxeAudio",
      siteDescription: "Premium Audio Equipment for Audiophiles",
      contactEmail: "contact@luxeaudio.com",
      contactPhone: "+1 (555) 123-4567",
      address: "123 Audio Street, Sound City, SC 90210",
      currencySymbol: "$",
      socialLinks: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
      },
    });

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
