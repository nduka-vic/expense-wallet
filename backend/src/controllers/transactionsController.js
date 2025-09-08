import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
  try {
    // >> Retrieve data
    const { userId } = req.params;

    // >> Copy record from database
    const transactions = await sql`
       SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
    `;

    // >> Confirm response
    res.status(200).json(transactions);
  } catch (error) {
    console.log("Error getting transaction: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function postTransaction(req, res) {
  try {
    // >> Retrieve data
    const { title, amount, category, user_id } = req.body;

    if (!title || !category || !user_id || amount === undefined) {
      console.log("title:", title);
      console.log("category:", category);
      console.log("user_id:", user_id);
      console.log("amount:", amount);

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
}

export async function deleteTransaction(req, res) {
  try {
    // >> Retriving data
    const { id } = req.params;

    // check if ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    // >> remove record from DB
    const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *
          `;

    // check if any record was found
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // >> Confirm response
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.log("Error deleting transaction: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTransactionSummaryByUserId(req, res) {
  try {
    // >> Retrieve data
    const { userId } = req.params;

    // >> compute records in DB
    const balanceResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance FROM transactions
            WHERE user_id = ${userId}
          `;

    const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as income FROM transactions
            WHERE user_id = ${userId} AND amount > 0
          `;

    const expenseResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as expense FROM transactions
            WHERE user_id = ${userId} AND amount < 0
          `;

    // console.log(balanceResult);
    // console.log(incomeResult);

    // >> generate response
    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenseResult: expenseResult[0].expense,
    });
  } catch (error) {
    console.log("Error getting transaction summary: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
