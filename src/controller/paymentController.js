import {
  addPaymentService,
  deleteUsersPaymentService,
  getUsersAllPaymentsService,
  updatePaymentService,
} from "../service/paymentService.js";
import { handleResponse, mapPaymentResponse } from "../utils/response.js";

export const addPayment = async (req, res, next) => {
  try {
    const data = await addPaymentService(req);
    handleResponse(res, 201, "Payment added successfully", data);
  } catch (error) {
    console.log("Error Adding  payment : ", error);
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const data = await updatePaymentService(req, next);
    handleResponse(res, 201, "Payment updated successfully", data);
  } catch (error) {
    console.log("Error Updating payment : ", error);
    next(error);
  }
};

export const getUsersAllPayments = async (req, res, next) => {
  try {
    const data = await getUsersAllPaymentsService(req);
    handleResponse(
      res,
      200,
      "Payment fetched successfully",
      mapPaymentResponse(data)
    );
  } catch (error) {
    console.log("Error getting user's payments:", error);
    next(error);
  }
};

export const deleteUsersPayment = async (req, res, next) => {
  try {
    const data = await deleteUsersPaymentService(req);
    handleResponse(res, 200, "Payment deleted successfully", data);
  } catch (error) {
    console.log("Error deleting user's payment:", error);
    next(error);
  }
};
