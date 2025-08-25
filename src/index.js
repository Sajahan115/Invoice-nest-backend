import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import pool from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import { createUserTable } from "./data/createUserTable.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createInvoiceTable } from "./data/createInvoiceTable.js";
import invoiceRouter from "./routes/invoiceRouter.js";
import { createInvoiceItemTable } from "./data/createInvoiceItemTable.js";
import { createPaymentTable } from "./data/createPaymentTable.js";
import paymentRouter from "./routes/paymentRouter.js";
import { createRefreshTokenTable } from "./data/createRefreshTokenTable.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

//routes
app.use("/api", userRouter);
app.use("/api", invoiceRouter);
app.use("/api", paymentRouter);

//middleware
app.use(errorHandler);

createUserTable();
createInvoiceTable();
createInvoiceItemTable();
createPaymentTable();
createRefreshTokenTable();

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`Connected to database: ${result.rows[0].current_database}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
