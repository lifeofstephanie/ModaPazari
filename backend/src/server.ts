import mongoose from "mongoose";
import { app } from "./app";

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://stephanieanyanwu605_db_user:ciEhwT2C8XhlSyuy@modapazari.jgdqtzw.mongodb.net/?appName=ModaPazari";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`connected`);

    app.listen(PORT, () => {
      console.log(`connected to ${PORT}`);
    });
  })
  .catch((err) => console.error("error: ", err));
