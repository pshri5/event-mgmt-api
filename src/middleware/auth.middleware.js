import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { ApiError } from "./utils/ApiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Access denied. Admin permission required.");
    }
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized access");
  }
};