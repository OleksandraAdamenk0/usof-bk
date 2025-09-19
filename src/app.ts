import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import router from "./routes/router.js";

process.on("exit", (code) => {
  console.log("Process exiting with code:", code);
});
process.on("beforeExit", (code) => {
  console.log("Process beforeExit with code:", code);
});

const PORT = process.env.PORT || 5051;

const app = express();

app.use(cors({
  origin: "*",
  credentials: false
}));

app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.static("public"));

app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});