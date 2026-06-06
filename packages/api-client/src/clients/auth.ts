import { request } from "./base";
import type { LoginResponse } from "../contracts/auth";

export function createAuthClient(baseUrl: string) {
  return {
    login(): Promise<LoginResponse> {
      return request<LoginResponse>(baseUrl, "/login");
    },
  };
}
