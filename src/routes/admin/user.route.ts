import { UserController } from "../../controllers/user.controller";
import { Router } from "express";
import multer from "multer";

const userRouter = Router();
const userController = new UserController();

const upload = multer({
  dest: "uploads/",
});

userRouter.post("/register", userController.createUser);

userRouter.post("/login", userController.loginUser);

userRouter.post(
  "/update/:id",
  upload.single("profileImage"),
  userController.updateProfile
);

export default userRouter;