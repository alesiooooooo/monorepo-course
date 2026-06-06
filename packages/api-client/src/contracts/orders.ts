export interface CreateOrderRequest {
  productId: string;
  qty: number;
}

export interface CreateOrderResponse {
  orderId: string;
  createdAt: string;
}
