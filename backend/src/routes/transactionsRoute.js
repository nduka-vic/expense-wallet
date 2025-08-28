import express from "express";
import {
  getTransactionsByUserId,
  postTransaction,
  deleteTransaction,
  getTransactionSummaryByUserId,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/:userId", getTransactionsByUserId); // creating a get endpoint
router.post("/", postTransaction); // creating a post endpoint
router.delete("/:id", deleteTransaction); // creating a delete endpoint
router.get("/summary/:userId", getTransactionSummaryByUserId);

export default router;
