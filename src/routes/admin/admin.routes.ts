import { Router } from "express";
import { AdminUserController } from "../../controllers/admin.user.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorized.middleware";

const router = Router();

router.use("/users", authorizedMiddleware, adminMiddleware);

router.get("/users", AdminUserController.getAllUsers);
router.get("/users/:id", AdminUserController.getUserById);
router.post("/users", AdminUserController.createUser);
router.put("/users/:id", AdminUserController.updateUser);
router.patch("/users/:id", AdminUserController.updateUser);
router.delete("/users/:id", AdminUserController.deleteUser);

export default router;