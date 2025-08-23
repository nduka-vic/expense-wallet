import express from "express";
// To access environment variables
import dotenv from "dotenv";
import { sql } from "./config/db.js";

// To access environment variables
dotenv.config();

// create an express app
const app = express();

// creating a middleware
app.use(express.json());

// create a PORT reference to .env variable
const PORT = process.env.PORT;

// initialise the database
async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initialising DB", error);
    process.exit(1); // status code 1 means failure, 0 success
  }
}

// creating a get request
// app.get("/", (req, res) => {
//   res.send("It's working");
// });

app.get("/api/transactions/:userId", async (req, res) => {
  try {
    // >> Retrieve data
    const { userId } = req.params;

    // >> Copy data from database
    const transactions = await sql`
        SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;

    // >> Confirm response
    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting transaction: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// creating a post request
app.post("/api/transactions", async (req, res) => {
  try {
    // >> Retrieve data
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // >> Commit data to database
    // insert values into database
    const transaction = await sql`
      INSERT INTO transactions(user_id,title,amount,category)
      VALUES (${user_id},${title},${amount},${category})
      RETURNING *
    `;

    // >> Confirm response
    console.log(transaction);
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("Error creating transaction", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

initDB().then(() => {
  // listen to a port
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  });
});
