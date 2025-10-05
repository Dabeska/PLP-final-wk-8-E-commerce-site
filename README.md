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
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

Open two terminals: one for backend and one for frontend.

---

## Environment / Credentials

Admin (pre-seeded)
```
email: admin@example.com
password: Admin123!
```

Public / demo Supabase keys (for grading)
- The project may include demo Supabase URL and anon key in the repo’s `.env` for grading. If you prefer to use your own Supabase project, create a new project and set these in `.env`:

```
REACT_APP_SUPABASE_URL=https://<your-supabase-url>
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
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
