// Типизированная ошибка — потребитель ловит её и знает структуру
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
