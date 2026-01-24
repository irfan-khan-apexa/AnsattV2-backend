// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./src/loaders/database";
// import cors from "cors";
// dotenv.config();
// // console.log("ENV LOADED:", {
// //   WASABI_ACCESS_KEY: process.env.WASABI_ACCESS_KEY,
// //   WASABI_SECRET_KEY: process.env.WASABI_SECRET_KEY,
// // });

// import { router } from "./src/modules/routes/index";
// import wasabiS3 from "./src/config/wasabi";

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ CORS Configuration — Add this before routes!
// // const allowedOrigins = [
// //   "http://localhost:8081",
// //   "https://your-frontend.netlify.app",
// //   "https://ansatt--d1k0v36vat.expo.app",
// //   "https://ansatt--hpl0ntrzk0.expo.app",
// // ];

// // app.use(
// //   cors({
// //     origin: (origin, callback) => {
// //       if (!origin || allowedOrigins.includes(origin)) {
// //         callback(null, true);
// //       } else {
// //         callback(new Error("Not allowed by CORS"));
// //       }
// //     },
// //     credentials: true,
// //   })
// // );

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

// // Middleware
// app.use(express.json());

// // Connect to Database
// connectDB();

// // Sample route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// // Mount the router
// app.use("/api", router);

// // Start the server
// app.listen(PORT, () => {
//   console.log(` Server running on http://localhost:${PORT}`);
// });

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/loaders/database";
import { router } from "./src/modules/routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * ======================================================
 * 1️⃣ CORS — SIMPLE, BULLETPROOF, NO REGEX, NO CALLBACK
 * ======================================================
 * - origin: true  → browser ka origin reflect karega
 * - JWT header auth → credentials false
 */
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

/**
 * ======================================================
 * 2️⃣ FORCE CORS HEADERS ON **EVERY RESPONSE**
 * (success + error + edge cases)
 * ======================================================
 */
app.use((req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight shortcut
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

/**
 * ======================================================
 * 3️⃣ BODY PARSER
 * ======================================================
 */
app.use(express.json());

/**
 * ======================================================
 * 4️⃣ DATABASE
 * ======================================================
 */
connectDB();

/**
 * ======================================================
 * 5️⃣ HEALTH CHECK
 * ======================================================
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running...");
});

/**
 * ======================================================
 * 6️⃣ ROUTES
 * ======================================================
 */
app.use("/api", router);

/**
 * ======================================================
 * 7️⃣ GLOBAL ERROR HANDLER (VERY IMPORTANT)
 * ERROR RESPONSE PE BHI CORS HEADERS AAYENGE
 * ======================================================
 */
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const origin = req.headers.origin;

    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

/**
 * ======================================================
 * 8️⃣ START SERVER
 * ======================================================
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
