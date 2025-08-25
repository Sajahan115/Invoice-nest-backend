import {
  deleteUsersPaymentRepo,
  getPaymentById,
  getTotalPaymentsByUser,
  getUsersAllPaymentsRepo,
  insertPaymentRepo,
  updatePaymentRepo,
  updateUserTotalPayment,
} from "../model/paymentModel.js";
import {
  getUserByUserNameOrUserIdService,
  updateTotalPaymentAmountService,
} from "../model/userModel.js";

export const addPaymentService = async (req) => {
  const { userId } = req.params;

  if (isNaN(Number(userId))) {
    const err = new Error("Invalid User Id");
    err.status = 400;
    return next(err);
  }

  const user = await getUserByUserNameOrUserIdService(null, userId);
  const data = await insertPaymentRepo(req.body, userId);
  if (data) {
    const totalPayment =
      Number(user.total_payment_amount) + Number(data.amount);
    const result = await updateTotalPaymentAmountService(userId, totalPayment);
    console.log(result);
  }
  return data;
};

export const getUsersAllPaymentsService = async (req) => {
  const { userId } = req.params;
  const { financialYear, startDate, endDate } = req.query;

  if (isNaN(Number(userId))) {
    const err = new Error("Invalid User Id");
    err.status = 400;
    return next(err);
  }

  const data = await getUsersAllPaymentsRepo(
    userId,
    financialYear,
    startDate,
    endDate
  );
  return data;
};

export const updatePaymentService = async (req) => {
  const { userId } = req.params;
  const { paymentId } = req.body;

  if (isNaN(Number(userId))) {
    throw Object.assign(new Error("Invalid User Id"), { status: 400 });
  }
  const existingUser = await getUserByUserNameOrUserIdService(null, userId);
  if (!existingUser) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  const existingPayment = await getPaymentById(paymentId);
  if (!existingPayment) {
    throw Object.assign(new Error("Payment not found"), { status: 404 });
  }

  const updatedPayment = await updatePaymentRepo(req.body, userId);

  const totalPayment = await getTotalPaymentsByUser(userId);
  await updateUserTotalPayment(userId, totalPayment);

  return updatedPayment;
};

export const deleteUsersPaymentService = async (req) => {
  const { userId } = req.params;

  const { paymentId } = req.body;

  if (isNaN(Number(userId))) {
    throw Object.assign(new Error("Invalid User Id"), { status: 400 });
  }
  const existingUser = await getUserByUserNameOrUserIdService(null, userId);
  if (!existingUser) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  const existingPayment = await getPaymentById(paymentId);
  if (!existingPayment) {
    throw Object.assign(new Error("Payment not found"), { status: 404 });
  }

  const deletedPayment = await deleteUsersPaymentRepo(paymentId, userId);

  const totalPayment = await getTotalPaymentsByUser(userId);

  await updateUserTotalPayment(userId, totalPayment);
  return deletedPayment;
};
