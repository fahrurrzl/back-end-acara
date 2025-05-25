import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import router from "./routes/api";
import db from "./utils/database";
import docs from "./docs/route";

async function init() {
  try {
    const result = await db();
    console.log("result", result);

    const app = express();

    app.use(
      cors({
        origin: ["http://localhost:3000", "https://acara-black.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );
    app.use(bodyParser.json());

    const PORT = 3001;

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });

    app.use("/api", router);
    docs(app);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
