import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = async (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    const createdUser = await User.findById(user._id).select("-password");

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200, 
          { user: loggedInUser, accessToken }, 
          "User logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while logging out");
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User profile fetched successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    if (!firstName && !lastName) {
      throw new ApiError(400, "At least one field is required for update");
    }
    
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select("-password");
    
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile
};