import { fetchOrders } from "@/lib/naver-orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await fetchOrders();
    return Response.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return Response.json(
      { error: "주문 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
