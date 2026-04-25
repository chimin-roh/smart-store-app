import { getAccessToken } from "./naver-auth";
import { proxyFetch } from "./proxy-fetch";
import type { Order, GroupedOrder, CategorizedOrders } from "./types";

const API_BASE = "https://api.commerce.naver.com/external";
const DAY_MS = 24 * 60 * 60 * 1000;

// 발송 관련 상태
const SHIPPED_STATUSES = ["DELIVERING", "DELIVERED", "PURCHASE_DECIDED"];

async function fetchOrdersForRange(
  token: string,
  from: Date,
  to: Date,
): Promise<Order[]> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
    rangeType: "PAYED_DATETIME",
    pageSize: "100",
    page: "1",
  });

  const res = await proxyFetch(
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
      buyerId: order.ordererId ?? "",
      buyerName: order.ordererName ?? "",
      orderDate: order.orderDate ?? "",
      productName: productOrder.productName ?? "",
      productOption: productOrder.productOption ?? "",
      quantity: productOrder.quantity ?? 0,
      orderStatus: productOrder.productOrderStatus ?? "",
    };
  });
}

async function fetchRawOrders(): Promise<Order[]> {
  const token = await getAccessToken();
  const now = new Date();

  // 14일을 500ms 간격으로 병렬 발사 (rate limit 초당 2회)
  const promises = Array.from({ length: 14 }, (_, i) => {
    const to = new Date(now.getTime() - i * DAY_MS);
    const from = new Date(to.getTime() - DAY_MS);
    return new Promise<Order[]>((resolve) =>
      setTimeout(() => resolve(fetchOrdersForRange(token, from, to)), i * 500),
    );
  });
  const allOrders = (await Promise.all(promises)).flat();

  return allOrders;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
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

  // 발송된 주문은 오늘 것만, 나머지는 모두 표시
  const visible = filtered.filter((o) => {
    if (SHIPPED_STATUSES.includes(o.orderStatus)) {
      return isToday(o.orderDate);
    }
    return true;
  });

  // 주문자 ID 기준으로 묶기 (동명이인 구분)
  const groups = new Map<string, Order[]>();
  for (const order of visible) {
    const key = order.buyerId || order.buyerName;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
  }

  // 분류
  const result: CategorizedOrders = { 핀버튼: [], 스티커: [], 복합주문: [] };

  for (const [, items] of groups) {
    const latest = items.reduce((a, b) =>
      new Date(a.orderDate) > new Date(b.orderDate) ? a : b,
    );
    const category = categorize(items);
    const grouped: GroupedOrder = {
      orderId: items.map((i) => i.orderId).filter((v, i, a) => a.indexOf(v) === i).join(","),
      buyerId: items[0].buyerId,
      buyerName: items[0].buyerName,
      orderDate: latest.orderDate,
      category,
      items: items.map((i) => ({
        productOrderId: i.productOrderId,
        productName: i.productName,
        productOption: i.productOption,
        quantity: i.quantity,
      })),
    };
    result[category].push(grouped);
  }

  // 최신 주문이 위로
  const sortByDate = (a: GroupedOrder, b: GroupedOrder) =>
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
  result.핀버튼.sort(sortByDate);
  result.스티커.sort(sortByDate);
  result.복합주문.sort(sortByDate);

  return result;
}
