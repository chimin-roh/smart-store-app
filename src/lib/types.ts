export interface Order {
  productOrderId: string;
  orderId: string;
  buyerName: string;
  orderDate: string;
  productName: string;
  productOption: string;
  quantity: number;
  orderStatus: string;
}

export type OrderCategory = "핀버튼" | "스티커" | "복합주문";

export interface GroupedOrder {
  orderId: string;
  buyerName: string;
  orderDate: string;
  category: OrderCategory;
  items: { productOrderId: string; productName: string; productOption: string; quantity: number }[];
}

export interface CategorizedOrders {
  핀버튼: GroupedOrder[];
  스티커: GroupedOrder[];
  복합주문: GroupedOrder[];
}

export type CompletionState = Record<string, boolean>;

export type BuyerImages = Record<string, string[]>;

export interface NaverTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
