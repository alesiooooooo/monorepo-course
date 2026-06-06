import "dotenv/config";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { log } from "@app/shared-utils";
import { createAuthClient, ApiError } from "@app/api-client";
import type { CreateOrderResponse } from "@app/api-client";

const PORT = Number(process.env.PORT) || 3002;
const AUTH_URL = process.env.AUTH_SERVICE_URL!;

// Создаём клиент один раз при старте — потом просто вызываем методы
const authClient = createAuthClient(AUTH_URL);

const app = express();
app.use(express.json());

app.post("/orders", async (_req, res) => {
  log("orders-service", "получен запрос на заказ");

  try {
    // 1. идём в auth
    log("orders-service", "иду в auth за токеном");
    const auth = await authClient.login();
    log("orders-service", `получен токен, expiresAt=${auth.expiresAt}`);

    // 2. создаём заказ
    const body: CreateOrderResponse = {
      orderId: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    log("orders-service", `создан заказ ${body.orderId}`);
    res.json(body);
  } catch (err) {
    if (err instanceof ApiError) {
      log("orders-service", `auth недоступен: ${err.status}`);
      res.status(502).json({ error: "auth unavailable" });
      return;
    }
    throw err;
  }
});

app.listen(PORT, () => log("orders-service", `слушаю ${PORT}`));
