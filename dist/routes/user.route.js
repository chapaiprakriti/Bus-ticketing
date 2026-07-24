"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user.controller");
const express_1 = require("express");
const uplode_middleware_1 = require("../middlewares/uplode.middleware");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const userRouter = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Public routes
userRouter.post("/register", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
// Forgot / reset password (public — no auth required)
userRouter.post("/forgot-password", userController.forgotPassword.bind(userController));
userRouter.post("/reset-password", userController.resetPassword.bind(userController));
// Sprint 3: logged in user detail
userRouter.get("/whoami", authorized_middleware_1.authorizedMiddleware, userController.whoami.bind(userController));
// Sprint 3: update profile + image + password
userRouter.put("/update", authorized_middleware_1.authorizedMiddleware, uplode_middleware_1.uploadProfileImage.single("avatar"), userController.updateProfile.bind(userController));
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map