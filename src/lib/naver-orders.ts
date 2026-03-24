import { getAccessToken } from "./naver-auth";
import type { Order, GroupedOrder, CategorizedOrders } from "./types";

const API_BASE = "https://api.commerce.naver.com/external";

async function fetchRawOrders(): Promise<Order[]> {
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

    return {
      productOrderId: item.productOrderId ?? "",
      orderId: order.orderId ?? "",
      buyerName: order.ordererName ?? "",
      orderDate: order.orderDate ?? "",
      productName: productOrder.productName ?? "",
      productOption: productOrder.productOption ?? "",
      quantity: productOrder.quantity ?? 0,
      orderStatus: productOrder.productOrderStatus ?? "",
    };
  });
}

function categorize(items: Order[]): GroupedOrder["category"] {
  const hasPin = items.some((i) => i.productName.includes("핀버튼"));
  const hasSticker = items.some((i) => i.productName.includes("스티커"));
  if (hasPin && hasSticker) return "복합주문";
  if (hasPin) return "핀버튼";
  if (hasSticker) return "스티커";
  return "핀버튼"; // fallback
}

export async function fetchOrders(): Promise<CategorizedOrders> {
  const raw = await fetchRawOrders();

  // 취소 주문 및 개별재단 제외
  const filtered = raw.filter(
    (o) =>
      !o.productName.includes("개별재단") &&
      !o.orderStatus.includes("CANCEL"),
  );

  // orderId 기준으로 묶기
  const groups = new Map<string, Order[]>();
  for (const order of filtered) {
    const key = order.orderId;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
  }

  // 분류
  const result: CategorizedOrders = { 핀버튼: [], 스티커: [], 복합주문: [] };

  for (const [orderId, items] of groups) {
    const first = items[0];
    const category = categorize(items);
    const grouped: GroupedOrder = {
      orderId,
      buyerName: first.buyerName,
      orderDate: first.orderDate,
      category,
      items: items.map((i) => ({
        productName: i.productName,
        productOption: i.productOption,
        quantity: i.quantity,
      })),
    };
    result[category].push(grouped);
  }

  // 과거 주문(오래된 것)부터 정렬
  const sortByDate = (a: GroupedOrder, b: GroupedOrder) =>
    new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
  result.핀버튼.sort(sortByDate);
  result.스티커.sort(sortByDate);
  result.복합주문.sort(sortByDate);

  return result;
}
