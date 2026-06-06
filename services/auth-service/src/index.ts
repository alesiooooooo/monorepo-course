import "dotenv/config";
import express from "express";
import { log } from "@app/shared-utils";
import type { LoginResponse } from "@app/api-client"; // ← тип ответа

const app = express();
const PORT = process.env.PORT ?? "3001";

app.get("/login", (_req, res) => {
  log("auth-service", "login");
  // TypeScript теперь следит чтобы ответ соответствовал контракту
  const body: LoginResponse = {
    token: "fake-jwt",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };
  res.json(body);
});

app.listen(PORT, () => log("auth-service", `слушаю ${PORT}`));
