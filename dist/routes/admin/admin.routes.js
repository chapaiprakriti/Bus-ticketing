"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_controller_1 = require("../../controllers/admin.user.controller");
const authorized_middleware_1 = require("../../middlewares/authorized.middleware");
const router = (0, express_1.Router)();
router.use("/users", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware);
router.get("/users", admin_user_controller_1.AdminUserController.getAllUsers);
router.get("/users/:id", admin_user_controller_1.AdminUserController.getUserById);
router.post("/users", admin_user_controller_1.AdminUserController.createUser);
router.put("/users/:id", admin_user_controller_1.AdminUserController.updateUser);
router.patch("/users/:id", admin_user_controller_1.AdminUserController.updateUser);
router.delete("/users/:id", admin_user_controller_1.AdminUserController.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map