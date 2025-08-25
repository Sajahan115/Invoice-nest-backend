import express from "express";
import pkg from "multer";
import {
  getAllUsers,
  getUser,
  loginUser,
  logOutUser,
  registerUser,
  rotateRefreshToken,
  sendEmailController,
  updateUser,
} from "../controller/userController.js";
import { validateUserInput } from "../middleware/inputValidator.js";
import {
  validateToken,
  verifyAdmin,
  verifyAdminOrSelf,
} from "../middleware/authMiddleware.js";

const upload = pkg({ storage: pkg.memoryStorage() });
const router = express.Router();
router.post(
  "/user/register",
  validateUserInput,
  validateToken,
  verifyAdmin,
  registerUser
);
router.post("/user/login", loginUser);
router.get("/user", validateToken, verifyAdmin, getAllUsers);
router.get("/user/:userId", validateToken, verifyAdminOrSelf, getUser);
router.put("/user/:userId", validateToken, verifyAdmin, updateUser);

router.post("/refresh", rotateRefreshToken);
router.post("/user/logout", logOutUser);
router.post(
  "/send-email",
  validateToken,
  verifyAdmin,
  upload.single("image"),
  sendEmailController
);

export default router;
