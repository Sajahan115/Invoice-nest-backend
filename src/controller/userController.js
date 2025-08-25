import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createUserService,
  deleteRefreshTokenService,
  getAllUsersService,
  getRefreshTokenService,
  getUserByUserNameOrUserIdService,
  saveRefreshTokenService,
  updateUserByUserIdService,
} from "../model/userModel.js";
import {
  handleResponse,
  mapAllUsersResponse,
  mapUserResponse,
} from "../utils/response.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { getLastInvoiceByUserIdService } from "../model/invoiceModel.js";
import { getLastPaymentByUserIdRepo } from "../model/paymentModel.js";
import { sendInvoiceEmail } from "../utils/common.js";

export const registerUser = async (req, res, next) => {
  try {
    const newUser = await createUserService(req.body);
    handleResponse(
      res,
      201,
      "User created successfully",
      mapUserResponse(newUser)
    );
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await getUserByUserNameOrUserIdService(username);

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      const err = new Error("Invalid password");
      err.status = 401;
      return next(err);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

    await saveRefreshTokenService({
      userId: user.user_id,
      token: refreshToken,
      expiresAt,
    });

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        status: 200,
        message: "User logged in successfully",
        data: {
          token: accessToken,
        },
      });
  } catch (error) {
    console.log("Error logging in user:", error);
    next(error);
  }
};

export const rotateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const err = new Error("Refresh token is missing");
      err.status = 403;
      return next(err);
    }

    const result = await getRefreshTokenService(refreshToken);

    if (result.rowCount === 0) {
      return handleResponse(res, 403, "Invalid refresh token");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = {
      user_id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await saveRefreshTokenService({
      userId: user.user_id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days,
    });

    return res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        status: 200,
        message: "Refresh Token Generated Successfully",
        data: {
          token: newAccessToken,
        },
      });
  } catch (error) {
    console.log("Error rotating refresh token:", error);
    next(error);
  }
};

export const logOutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const err = new Error("Refresh token is missing");
      err.status = 403;
      return next(err);
    }

    const results = await deleteRefreshTokenService(refreshToken);

    if (results.rowCount === 0) {
      const err = new Error("Refresh token is Invalid");
      err.status = 403;
      return next(err);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      status: 200,
      message: "User logged out successfully",
      data: null,
    });
  } catch (error) {
    console.log("Error logging out:", error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    const userDetails = [];

    for (const user of users) {
      const lastInvoice = await getLastInvoiceByUserIdService(user.user_id);
      const lastPayment = await getLastPaymentByUserIdRepo(user.user_id);
      mapAllUsersResponse(userDetails, user, lastInvoice, lastPayment);
    }

    handleResponse(res, 200, "All users fetched successfully", userDetails);
  } catch (error) {
    console.error("Error getting all users:", error);
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (isNaN(Number(userId))) {
      const err = new Error("Invalid User Id");
      err.status = 400;
      return next(err);
    }

    const user = await getUserByUserNameOrUserIdService(null, userId);
    handleResponse(
      res,
      200,
      "User fetched successfully",
      mapUserResponse(user)
    );
  } catch (error) {
    console.log("Error getting user:", error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (isNaN(Number(userId))) {
      const err = new Error("Invalid User Id");
      err.status = 400;
      return next(err);
    }

    const updatedUser = await updateUserByUserIdService(userId, req.body);
    handleResponse(
      res,
      200,
      "User updated successfully",
      mapUserResponse(updatedUser)
    );
  } catch (error) {
    console.log("Error updating user:", error);
    next(error);
  }
};

export const sendEmailController = async (req, res, next) => {
  try {
    const { to, subject, body } = req.body;
    const file = req.file;

    if (!to || !file) {
      const err = new Error("Email and image are required");
      err.status = 400;
      return next(err);
    }

    const result = await sendInvoiceEmail({
      to: to,
      subject: subject || "Your Invoice",
      body: body || "Please find your invoice attached.",
      buffer: file.buffer,
    });
    return handleResponse(res, 200, "Email sent successfully", result);
  } catch (error) {
    console.error("Failed to send invoice image:", error);
    next(error);
  }
};
