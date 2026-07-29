import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URL_TEST || "mongodb://localhost:27017/seatsathi_test";

beforeAll(async () => {
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
