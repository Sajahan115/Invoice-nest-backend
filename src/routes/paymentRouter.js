import express from "express";
import {
  validateToken,
  verifyAdmin,
  verifyAdminOrSelf,
} from "../middleware/authMiddleware.js";
import {
  addPayment,
  deleteUsersPayment,
  getUsersAllPayments,
  updatePayment,
} from "../controller/paymentController.js";
import {
  validateAddPaymentInput,
  validateDeletePaymentInput,
  validateUpdatePaymentInput,
} from "../middleware/inputValidator.js";

const paymentRouter = express.Router();

paymentRouter.get(
  "/payment/:userId",
  validateToken,
  verifyAdminOrSelf,
  getUsersAllPayments
);
paymentRouter.post(
  "/payment/:userId",
  validateToken,
  verifyAdmin,
  validateAddPaymentInput,
  addPayment
);
paymentRouter.put(
  "/payment/:userId",
  validateToken,
  verifyAdmin,
  validateUpdatePaymentInput,
  updatePayment
);
paymentRouter.delete(
  "/payment/:userId",
  validateToken,
  verifyAdmin,
  validateDeletePaymentInput,
  deleteUsersPayment
);

export default paymentRouter;
