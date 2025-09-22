import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile 
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);
router.patch("/profile", verifyJWT, updateUserProfile);

export default router;