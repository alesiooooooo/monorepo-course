// Клиенты
export { createAuthClient } from "./clients/auth";

// Контракты — переэкспорт, чтобы сервер тоже мог типизировать ответы
export * from "./contracts/auth";
export * from "./contracts/orders";
export { ApiError } from "./contracts/errors";
