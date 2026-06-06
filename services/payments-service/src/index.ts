import "dotenv/config";
import express from "express";
import { log } from "@app/shared-utils";

const app = express();
const PORT = process.env.PORT ?? "3003";

app.get("/pay", (_req, res) => {
  log("payments-service", "pay");
  res.json({ status: "paid" });
});

app.listen(PORT, () => log("payments-service", `слушаю ${PORT}`));
