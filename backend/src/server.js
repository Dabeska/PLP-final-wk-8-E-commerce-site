require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const supabase = require("./supabaseClient");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const statusRoutes = require("./routes/statusRoutes");

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : ["*"];

const corsOptions = {
  origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  credentials: true
};

app.set("supabase", supabase);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ data: { status: "ok" }, error: null });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/statuses", statusRoutes);

app.use((req, res) => {
  res.status(404).json({ data: null, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  res.status(err.status || 500).json({
    data: null,
    error: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
