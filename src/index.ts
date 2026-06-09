import app, { PORT } from "./app";
import { connectToMongoDB } from "./database/mongodb";

connectToMongoDB();

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});