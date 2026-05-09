# NeonStore — Full-Stack E-Commerce Application

## Overview
NeonStore is a fully functional e-commerce platform with user authentication, admin dashboard, product management, shopping cart, checkout, and order tracking. Built with Express.js, Neon PostgreSQL, and Tailwind CSS.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Frontend:** HTML, Tailwind CSS (CDN), Vanilla JavaScript
- **Icons:** Font Awesome 6

---

## Features

### 1. Authentication
- User **Sign Up** with name, email, password (bcrypt-hashed)
- User **Sign In** with email + password → returns JWT (7-day expiry)
- Role-based access: `admin` and `user` roles
- Auth-aware UI across all pages

### 2. Admin Dashboard (`/admin.html`)
| Feature | Description |
|---------|-------------|
| **Statistics** | Total revenue, total orders, total products, total users |
| **Product Management** | Create, edit, delete products with modal form |
| **Order Management** | View all orders, update status, view order details |
| **Order Status Flow** | Processing → Confirmed → Shipped → Out for Delivery → Delivered |

### 3. User Storefront (`/index.html`)
| Feature | Description |
|---------|-------------|
| **Browse Products** | Grid view with category filters and search |
| **Product Cards** | Image, name, price, stock badge, add-to-cart |
| **Shopping Cart** | Sidebar with quantity controls, subtotal, checkout |
| **Checkout** | Shipping form → places order (requires login) |

### 4. User Account (`/account.html`)
| Feature | Description |
|---------|-------------|
| **Profile** | View name, email, account creation date |
| **Order History** | List of all past orders |
| **Order Details** | Items, totals, shipping info |
| **Order Tracking** | Visual timeline showing order progress |

---

## API Routes

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login → returns JWT |
| GET | `/api/auth/me` | Auth | Get current user info |

### Products
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/products` | Public | List all products |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/orders` | Auth | Place new order |
| GET | `/api/orders` | Auth | List orders (user→own, admin→all) |
| GET | `/api/orders/:id` | Auth | Get order details |
| PUT | `/api/orders/:id/status` | Admin | Update order status |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |

---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, Required |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | VARCHAR(20) | `user` or `admin` |
| created_at | TIMESTAMP | Auto-set |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Required |
| description | TEXT | Optional |
| price | DECIMAL(10,2) | Required |
| image | VARCHAR(500) | URL |
| category | VARCHAR(100) | Filter key |
| stock | INTEGER | Default 0 |
| created_at | TIMESTAMP | Auto-set |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary Key |
| user_id | INTEGER | FK → users.id |
| tracking_number | VARCHAR(20) | Unique, auto-generated |
| full_name | VARCHAR(255) | Shipping name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(50) | Optional |
| address | TEXT | Shipping address |
| city | VARCHAR(100) | Optional |
| zip | VARCHAR(20) | Optional |
| items | JSONB | Cart items snapshot |
| total | DECIMAL(10,2) | Order total |
| status | VARCHAR(50) | Order status |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated |

---

## Pages

| URL | Description | Access |
|-----|-------------|--------|
| `/` | Storefront — browse & shop | Public |
| `/login.html` | Sign in | Public |
| `/signup.html` | Create account | Public |
| `/account.html` | User profile & orders | User |
| `/admin.html` | Admin dashboard | Admin |

---

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables** in `.env`:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_secret_key
   ```

3. **Seed the database** (creates tables + admin user + sample products):
   ```bash
   npm run seed
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

## Default Admin Account
- **Email:** `admin@neonstore.com`
- **Password:** `admin123`
