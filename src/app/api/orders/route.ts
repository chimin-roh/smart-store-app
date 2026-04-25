import { fetchOrders } from "@/lib/naver-orders";

export const dynamic = "force-dynamic";

const ALLOWED_DAYS = [7, 14] as const;
type AllowedDays = (typeof ALLOWED_DAYS)[number];

function parseDays(value: string | null): AllowedDays {
  const n = Number(value);
  return ALLOWED_DAYS.includes(n as AllowedDays) ? (n as AllowedDays) : 7;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseDays(searchParams.get("days"));
    const orders = await fetchOrders(days);
    return Response.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return Response.json(
      { error: "주문 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
