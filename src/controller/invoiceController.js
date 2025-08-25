import {
  createInvoiceService,
  editInvoiceService,
  getUsersInvoicesService,
} from "../service/invoiceService.js";
import { handleResponse } from "../utils/response.js";

export const createInvoice = async (req, res, next) => {
  try {
    const data = await createInvoiceService(req);
    handleResponse(res, 200, "Invoice created successfully", data);
  } catch (error) {
    handleResponse(
      res,
      error.status || 500,
      error.message || "Failed to create invoice"
    );
  }
};

export const editInvoice = async (req, res, next) => {
  try {
    const data = await editInvoiceService(req);
    handleResponse(res, 200, "Invoice updated successfully", data);
  } catch (error) {
    console.log("Error editinig  invoice : ", error);
    next(error);
  }
};

export const getUsersInvoices = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { query } = req;
    if (isNaN(Number(userId))) {
      const err = new Error("Invalid User Id");
      err.status = 400;
      return next(err);
    }

    const page = parseInt(query.page) || 1;
    const pageSize = parseFloat(query.pageSize) || 10;

    const data = await getUsersInvoicesService(userId, query, page, pageSize);
    handleResponse(res, 200, "Invoice fetched successfully", data);
    // const data = await
  } catch (error) {
    console.log("Error getting user:", error);
    next(error);
  }
};
