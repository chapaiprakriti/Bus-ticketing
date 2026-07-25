"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("../database/mongodb");
const user_model_1 = require("../models/user.model");
async function seedAdmin() {
    await (0, mongodb_1.connectToMongoDB)();
    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "adminpassword";
    const existing = await user_model_1.UserModel.findOne({ email });
    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        process.exit(0);
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    await user_model_1.UserModel.create({
        fullName: "Super Admin",
        email,
        contactNumber: "9800000000",
        gender: "other",
        password: hashedPassword,
        role: "admin",
    });
    console.log(`Admin user created: ${email} / ${password}`);
    process.exit(0);
}
seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-Admin.js.map