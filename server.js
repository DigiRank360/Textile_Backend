import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import mailRoutes from "./routes/mailRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "SET" : "MISSING");

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://eagleincensesticks.com",
  "https://www.eagleincensesticks.com",
  "https://admin.eagleincensesticks.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/mail", mailRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Eagle Backend is Running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});