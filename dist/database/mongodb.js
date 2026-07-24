"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("../configs/constant");
const connectToMongoDB = async () => {
    try {
        console.log("Trying to connect MongoDB...");
        await mongoose_1.default.connect(constant_1.MONGODB_URL);
        console.log("Connected to MongoDB successfully");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
exports.connectToMongoDB = connectToMongoDB;
//# sourceMappingURL=mongodb.js.map