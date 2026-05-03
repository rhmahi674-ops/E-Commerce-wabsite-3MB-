const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const sql = neon(process.env.DATABASE_URL);

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 40hr battery life, and hi-res audio.",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 45,
  },
  {
    name: "Minimalist Leather Watch",
    description: "Classic analog watch with genuine Italian leather strap and sapphire crystal glass.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    category: "Accessories",
    stock: 30,
  },
  {
    name: "Premium Cotton T-Shirt",
    description: "Ultra-soft 100% organic cotton tee with a modern relaxed fit. Available in multiple colors.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    category: "Clothing",
    stock: 120,
  },
  {
    name: "Running Sneakers Pro",
    description: "Lightweight performance running shoes with responsive cushioning and breathable mesh upper.",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    category: "Footwear",
    stock: 60,
  },
  {
    name: "Portable Bluetooth Speaker",
    description: "Waterproof 360° speaker with deep bass, 20hr playtime, and built-in microphone.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 80,
  },
  {
    name: "Ceramic Desk Lamp",
    description: "Modern minimalist desk lamp with touch dimmer, warm/cool light modes, and USB charging port.",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&h=500&fit=crop",
    category: "Home",
    stock: 35,
  },
  {
    name: "Canvas Backpack",
    description: "Durable waxed canvas backpack with padded laptop compartment and waterproof lining.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    category: "Accessories",
    stock: 50,
  },
  {
    name: "Slim Fit Denim Jeans",
    description: "Premium stretch denim with a modern slim fit. Dark indigo wash with subtle fading.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
    category: "Clothing",
    stock: 90,
  },
  {
    name: "Smart Home Speaker",
    description: "Voice-controlled smart speaker with room-filling sound and built-in AI assistant.",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 25,
  },
  {
    name: "Leather Chelsea Boots",
    description: "Handcrafted genuine leather Chelsea boots with cushioned insole and durable rubber sole.",
    price: 139.99,
    image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=500&fit=crop",
    category: "Footwear",
    stock: 20,
  },
  {
    name: "Scented Candle Set",
    description: "Set of 3 hand-poured soy wax candles with lavender, vanilla, and sandalwood scents.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500&h=500&fit=crop",
    category: "Home",
    stock: 70,
  },
  {
    name: "Polarized Sunglasses",
    description: "Classic aviator style with UV400 polarized lenses and lightweight titanium frame.",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    category: "Accessories",
    stock: 40,
  },
];

async function seed() {
  console.log("Creating products table...");
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500),
      category VARCHAR(100),
      stock INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Clearing existing products...");
  await sql`DELETE FROM products`;

  console.log("Inserting seed products...");
  for (const p of products) {
    await sql`
      INSERT INTO products (name, description, price, image, category, stock)
      VALUES (${p.name}, ${p.description}, ${p.price}, ${p.image}, ${p.category}, ${p.stock})
    `;
  }

  console.log(`Seeded ${products.length} products successfully!`);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
