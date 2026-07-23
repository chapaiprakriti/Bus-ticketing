import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { uploadProfileImage } from "../middlewares/uplode.middleware";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const userRouter = Router();
const userController = new UserController();

// Public routes
userRouter.post("/register", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));

// Forgot / reset password (public — no auth required)
userRouter.post("/forgot-password", userController.forgotPassword.bind(userController));
userRouter.post("/reset-password",  userController.resetPassword.bind(userController));

// Sprint 3: logged in user detail
userRouter.get(
  "/whoami",
  authorizedMiddleware,
  userController.whoami.bind(userController)
);

// Sprint 3: update profile + image + password
userRouter.put(
  "/update",
  authorizedMiddleware,
  uploadProfileImage.single("avatar"),
  userController.updateProfile.bind(userController)
);

export default userRouter;