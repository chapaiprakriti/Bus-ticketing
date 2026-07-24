import app, { PORT } from "./app";
import { connectToMongoDB } from "./database/mongodb";

connectToMongoDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
