# PLP-final-wk-8-E-commerce-site

# PLP-final-wk-8-E-commerce-site

A simple E‑commerce Store application.

Tech stack
- Backend: Node.js + Express + Supabase (PostgreSQL)
- Frontend: React + Vite + TailwindCSS
- Database & Storage: Supabase (product images stored in a bucket)

---

## Features
- User authentication (JWT)
- Admin authentication (pre-seeded credentials)
- Product & category CRUD
- Orders & order-items management
- Order status tracking
- Supabase Storage for product images

---

## Prerequisites
- Node.js v18+
- npm v9+
- (Optional) Supabase account if you want your own database

---

## Project setup

Clone the repo:
```bash
git clone <your-repo-url>
cd ecommerce-store
```

Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at: http://localhost:5000

Frontend
```bash
cd ..
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

Open two terminals: one for backend and one for frontend.

---

## Environment / Credentials

Admin (pre-seeded)
```
email: admin@shopsphere.com
password: password123
```

Public / demo Supabase keys (for grading)
- The project may include demo Supabase URL and anon key in the repo’s `.env` for grading. If you prefer to use your own Supabase project, create a new project and set these in `.env`:

```
# ==============================
# SERVER CONFIG
# ==============================
PORT=5000                # Port the backend runs on
NODE_ENV=development     # or production

# ==============================
# SUPABASE CONFIG
# ==============================
REACT_APP_SUPABASE_URL=https://tbirjjeisekbwowsbcky.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiaXJqamVpc2VrYndvd3NiY2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTU0NDcsImV4cCI6MjA3NTIzMTQ0N30.tZTv6wwcExOu_kUoX4NHmwa_aw5LtnFiMTqEKA19GtM

# ==============================
# AUTH CONFIG
# ==============================
JWT_SECRET=4wo9h+HHyn2jee4zPh+LJ0nqkCO0aUVld2+F5u9E+oOgcsxG1Ka2VUWdDCM+ruhi3I/NKnMsc+m+EIHy506Eog==
JWT_EXPIRES_IN=7d             

# ==============================
# SECURITY 
# ==============================
CORS_ORIGIN=http://localhost:5173   # Your React frontend origin
```

Do not commit sensitive secrets to version control.

---

## Database (optional — using your own Supabase)
1. Create a Supabase project.
2. Copy Project URL & anon key from Project Settings → API.
3. In Supabase SQL Editor run the provided `seed.sql` to create tables and sample data.
4. Update `.env` with your values.

Supabase storage: bucket name `product-images`. Product image public URLs are stored in `products.image_url`.

---

## API Endpoints

Auth
- POST /api/auth/register — register user
- POST /api/auth/login — login & receive JWT

Users
- GET /api/users/:id — get user
- PUT /api/users/:id — update user
- DELETE /api/users/:id — delete user

Products
- GET /api/products — get all products
- GET /api/products/:id — get product
- POST /api/products — add product (admin)
- PUT /api/products/:id — update product
- DELETE /api/products/:id — delete product

Categories
- GET /api/categories — get all categories
- GET /api/categories/:id — get category
- POST /api/categories — create category
- PUT /api/categories/:id — update category
- DELETE /api/categories/:id — delete category

Orders
- POST /api/orders — create order
- GET /api/orders — get all orders (admin)
- GET /api/orders/:id — get order details
- GET /api/orders/user/:uid — get user’s orders
- PUT /api/orders/:id — update order status
- DELETE /api/orders/:id — cancel/delete order

Order Items
- GET /api/orders/:id/items — get items in an order
- POST /api/orders/:id/items — add item to order
- PUT /api/order-items/:id — update order item
- DELETE /api/order-items/:id — delete order item

Statuses
- GET /api/statuses — get all statuses
- POST /api/statuses — create status
- PUT /api/statuses/:id — update status
- DELETE /api/statuses/:id — delete status

---

## Running (quick)
- Start backend: cd backend → npm run dev (http://localhost:5000)
- Start frontend: cd frontend → npm run dev (http://localhost:5173)

---

If you want a trimmed README or a badge/header added, tell me which badges or extra sections to include.
