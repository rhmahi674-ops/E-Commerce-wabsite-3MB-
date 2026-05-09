const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const sql = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "neonstore_jwt_secret_2026";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ========================
// MIDDLEWARE
// ========================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function admin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// ========================
// DATABASE INIT
// ========================
async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

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

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      tracking_number VARCHAR(20) UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT NOT NULL,
      city VARCHAR(100),
      zip VARCHAR(20),
      items JSONB NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Processing',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Add columns if they don't exist (for tables created before schema update)
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(20) UNIQUE`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;

  console.log("Database tables ready");
}

// ========================
// HELPERS
// ========================
function generateTrackingNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "NS-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ========================
// AUTH ROUTES
// ========================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${password_hash})
      RETURNING id, name, email, role
    `;
    const token = signToken(user[0]);
    res.status(201).json({ user: user[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const users = await sql`SELECT id, name, email, role, created_at FROM users WHERE id = ${req.user.id}`;
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// PRODUCT ROUTES
// ========================
app.get("/api/products", async (req, res) => {
  try {
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", auth, admin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const product = await sql`
      INSERT INTO products (name, description, price, image, category, stock)
      VALUES (${name}, ${description || ""}, ${price}, ${image || ""}, ${category || ""}, ${stock || 0})
      RETURNING *
    `;
    res.status(201).json(product[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, stock } = req.body;
    const product = await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price},
          image = ${image}, category = ${category}, stock = ${stock}
      WHERE id = ${id}
      RETURNING *
    `;
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted", product: product[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// ORDER ROUTES
// ========================
app.post("/api/orders", auth, async (req, res) => {
  try {
    const { full_name, email, phone, address, city, zip, items, total } = req.body;
    if (!full_name || !email || !address || !items || !total) {
      return res.status(400).json({ error: "Name, email, address, items and total are required" });
    }
    const tracking_number = generateTrackingNumber();
    const order = await sql`
      INSERT INTO orders (user_id, tracking_number, full_name, email, phone, address, city, zip, items, total)
      VALUES (${req.user.id}, ${tracking_number}, ${full_name}, ${email}, ${phone || ""}, ${address}, ${city || ""}, ${zip || ""}, ${JSON.stringify(items)}, ${total})
      RETURNING *
    `;
    res.status(201).json(order[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders", auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    } else {
      orders = await sql`SELECT * FROM orders WHERE user_id = ${req.user.id} ORDER BY created_at DESC`;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/orders/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let order;
    if (req.user.role === "admin") {
      order = await sql`SELECT * FROM orders WHERE id = ${id}`;
    } else {
      order = await sql`SELECT * FROM orders WHERE id = ${id} AND user_id = ${req.user.id}`;
    }
    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/orders/:id/status", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// ADMIN STATS
// ========================
app.get("/api/admin/stats", auth, admin, async (req, res) => {
  try {
    const revenue = await sql`SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders WHERE status != 'Cancelled'`;
    const orderCount = await sql`SELECT COUNT(*) as total_orders FROM orders`;
    const productCount = await sql`SELECT COUNT(*) as total_products FROM products`;
    const userCount = await sql`SELECT COUNT(*) as total_users FROM users WHERE role = 'user'`;
    const recentOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`;
    const statusCounts = await sql`SELECT status, COUNT(*) as count FROM orders GROUP BY status`;

    res.json({
      total_revenue: parseFloat(revenue[0].total_revenue),
      total_orders: parseInt(orderCount[0].total_orders),
      total_products: parseInt(productCount[0].total_products),
      total_users: parseInt(userCount[0].total_users),
      recent_orders: recentOrders,
      status_counts: statusCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// START SERVER
// ========================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
