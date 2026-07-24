"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../../controllers/user.controller");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const userRouter = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
const upload = (0, multer_1.default)({
    dest: "uploads/",
});
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.post("/update/:id", upload.single("profileImage"), userController.updateProfile);
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map