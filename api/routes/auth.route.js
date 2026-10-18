import express from "express";

import {
  signup,
  verifyOTP,
  resendOTP,
  login,
  forgetPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getAll,
  getById,
  getUserByUserId,
  deleteUser,
  getAllAdmins,
  getAllUsers
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", login);

router.post("/forgot-password", forgetPassword);

router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);

router.post("/reset-password", resetPassword);

router.get("/get-all", getAll);
router.get("/get-by-id/:id", getById);
router.get("/get-by-userId/:userId", getUserByUserId);
router.get("/get-all-admins", getAllAdmins);
router.get("/get-all-users", getAllUsers);
router.delete("/delete/:id", deleteUser);

export default router;