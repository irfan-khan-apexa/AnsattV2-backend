import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/loaders/database";
import cors from "cors";
dotenv.config();
// console.log("ENV LOADED:", {
//   WASABI_ACCESS_KEY: process.env.WASABI_ACCESS_KEY,
//   WASABI_SECRET_KEY: process.env.WASABI_SECRET_KEY,
// });

import { router } from "./src/modules/routes/index";
import wasabiS3 from "./src/config/wasabi";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration — Add this before routes!
// const allowedOrigins = [
//   "http://localhost:8081",
//   "https://your-frontend.netlify.app",
//   "https://ansatt--d1k0v36vat.expo.app",
//   "https://ansatt--hpl0ntrzk0.expo.app",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// const allowedOriginPatterns = [
//   /^http:\/\/localhost:\d+$/,
//   /^https:\/\/your-frontend\.netlify\.app$/,
//   /^https:\/\/.*\.expo\.app$/,
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (
//         !origin ||
//         allowedOriginPatterns.some((pattern) => pattern.test(origin))
//       ) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );


const allowedOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/.*\.netlify\.app$/,
  /^https:\/\/.*\.expo\.app$/,
  /^https:\/\/.*\.lovable\.(app|dev|ai)$/,
];

/**
 * NEW: Exact Lovable frontend URLs (ADD ONLY, DO NOT REMOVE ANYTHING)
 */
const allowedExactOrigins = [
  "https://id-preview--c929c7c4-1d7d-4d2b-b080-9e5ab54755af.lovable.app",
  "https://c929c7c4-1d7d-4d2b-b080-9e5ab54755af.lovableproject.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls / Postman
      if (!origin) {
        return callback(null, true);
      }

      // 1️⃣ Exact match check (Lovable provided URLs)
      if (allowedExactOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 2️⃣ Regex-based pattern check (existing logic)
      if (allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }

      // ❌ Block everything else
      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],

    // JWT header based auth (no cookies)
    credentials: false,
  })
);


// Middleware
app.use(express.json());

// Connect to Database
connectDB();

// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Mount the router
app.use("/api", router);

// Start the server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
