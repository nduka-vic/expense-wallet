import express from "express";
import dotenv from "dotenv"; // To access environment variables
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

dotenv.config(); // To access environment variables

const app = express(); // create an express app

if (process.env.NODE_ENV === "production") job.start();

// creating a middleware
app.use((req, res, next) => {
  if (req.path === "/api/health") return next();
  ratelimiter(req, res, next);
});

// app.use(ratelimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001; // create a PORT reference to .env variable

app.get("/api/health", (req, res) => {
  console.log("✅ Health check ping received at", new Date().toISOString());
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
  // listen to a port
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT: ", PORT);
  });
});
