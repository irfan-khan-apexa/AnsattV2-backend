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
const allowedOrigins = [
  "http://localhost:8081",
  "https://your-frontend.netlify.app",
  "https://ansatt--d1k0v36vat.expo.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
