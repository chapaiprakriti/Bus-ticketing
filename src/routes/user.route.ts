import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { uploadProfileImage } from "../middlewares/uplode.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));

userRouter.put(
  "/profile/:id",
  uploadProfileImage.single("profileImage"),
  userController.updateProfile.bind(userController)
);

export default userRouter;