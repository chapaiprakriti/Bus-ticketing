const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { whoami, updateProfile } = require("../controllers/auth.controller");

// Import existing register/login controllers (adjust path to match your project)
const { register, login } = require("../controllers/auth.controller.public");

// ── Public routes ────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ── Protected routes (require valid JWT) ────────────────────────
router.get("/whoami", authMiddleware, whoami);

// update: authMiddleware first, then multer (so req.user exists when naming the file)
router.put(
  "/update",
  authMiddleware,
  upload.single("avatar"),
  updateProfile
);

module.exports = router;
