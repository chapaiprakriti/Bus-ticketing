const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// GET /api/v1/auth/whoami
const whoami = async (req, res) => {
  try {
    // req.user is already populated by authMiddleware (password excluded)
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// PUT /api/v1/auth/update
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists and isn't the default
      if (user.avatar && !user.avatar.includes("default")) {
        const oldPath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Store relative path
      user.avatar = `uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = { whoami, updateProfile };
