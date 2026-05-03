const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const sql = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize table
async function initDB() {
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
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT NOT NULL,
      city VARCHAR(100),
      zip VARCHAR(20),
      items JSONB NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Processing',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Database tables ready");
}

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
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

// CREATE product
app.post("/api/products", async (req, res) => {
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

// UPDATE product
app.put("/api/products/:id", async (req, res) => {
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

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
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

// CREATE order
app.post("/api/orders", async (req, res) => {
  try {
    const { full_name, email, phone, address, city, zip, items, total } = req.body;
    if (!full_name || !email || !address || !items || !total) {
      return res.status(400).json({ error: "Name, email, address, items and total are required" });
    }
    const order = await sql`
      INSERT INTO orders (full_name, email, phone, address, city, zip, items, total)
      VALUES (${full_name}, ${email}, ${phone || ""}, ${address}, ${city || ""}, ${zip || ""}, ${JSON.stringify(items)}, ${total})
      RETURNING *
    `;
    res.status(201).json(order[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
