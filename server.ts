import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/loaders/database";
import cors from "cors";

import { router } from "./src/modules/routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration — Add this before routes!
const allowedOrigins = [
  "http://localhost:8081",
  "https://ansattv2-backend.onrender.com/",
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
