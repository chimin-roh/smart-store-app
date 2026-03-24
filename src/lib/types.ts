export interface Order {
  productOrderId: string;
  buyerName: string;
  orderDate: string;
  address: string;
  productName: string;
  quantity: number;
  orderStatus: string;
}

export interface NaverTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
