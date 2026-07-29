import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "test-resend-key";

const baseUri = process.env.MONGODB_URL_TEST || process.env.MONGODB_URL || "mongodb://localhost:27017/seatsathi_test";
const mongoUri = baseUri.includes("mongodb+srv")
  ? baseUri.replace(/^(mongodb\+srv:\/\/[^/]+\/)[^?]*/, `$1seatsathi_test`)
  : baseUri;

console.log("TEST_MONGO_URI:", mongoUri);

beforeAll(async () => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}, 30000);
