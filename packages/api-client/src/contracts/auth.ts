// То, что /login возвращает — единый источник правды
export interface LoginResponse {
  token: string;
  expiresAt: string; // ISO-дата
}

// Если бы /login принимал body — описали бы и LoginRequest
