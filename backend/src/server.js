import express from "express";
import dotenv from "dotenv"; // To access environment variables
import { initDB } from "./config/db.js";
import ratelimiter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

dotenv.config(); // To access environment variables

const app = express(); // create an express app

// creating a middleware
app.use(ratelimiter);
app.use(express.json());

const PORT = process.env.PORT; // create a PORT reference to .env variable

app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
  // listen to a port
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
