import { getAccessToken } from "./naver-auth";
import type { Order } from "./types";

const API_BASE = "https://api.commerce.naver.com/external";

export async function fetchOrders(): Promise<Order[]> {
  const token = await getAccessToken();

  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    rangeType: "PAYED_DATETIME",
    pageSize: "100",
    page: "1",
  });

  const res = await fetch(
    `${API_BASE}/v1/pay-order/seller/product-orders?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver orders API failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const contents = data.data?.contents ?? [];

  return contents.map((item: Record<string, any>) => {
    const order = item.content?.order ?? {};
    const productOrder = item.content?.productOrder ?? {};
    const shipping = productOrder.shippingAddress ?? {};

    return {
      productOrderId: item.productOrderId ?? "",
      buyerName: order.ordererName ?? "",
      orderDate: order.orderDate ?? "",
      address: [shipping.baseAddress, shipping.detailedAddress]
        .filter(Boolean)
        .join(" "),
      productName: productOrder.productName ?? "",
      quantity: productOrder.quantity ?? 0,
      orderStatus: productOrder.productOrderStatus ?? "",
    };
  });
}
