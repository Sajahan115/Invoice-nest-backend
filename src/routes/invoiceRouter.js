import express from "express";
import {
  createInvoice,
  editInvoice,
  getUsersInvoices,
} from "../controller/invoiceController.js";
import {
  validateToken,
  verifyAdmin,
  verifyAdminOrSelf,
} from "../middleware/authMiddleware.js";
import {
  validateCreateInvoiceInput,
  validateEditInvoiceInput,
} from "../middleware/inputValidator.js";

const invoiceRouter = express.Router();

invoiceRouter.get(
  "/invoice/:userId",
  validateToken,
  verifyAdminOrSelf,
  getUsersInvoices
);
invoiceRouter.post(
  "/invoice",
  validateToken,
  verifyAdmin,
  validateCreateInvoiceInput,
  createInvoice
);
invoiceRouter.put(
  "/invoice/:invoiceId",
  validateToken,
  verifyAdmin,
  validateEditInvoiceInput,
  editInvoice
);

export default invoiceRouter;
