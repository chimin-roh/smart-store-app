"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/lib/types";

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("주문 조회 실패");
      const data = await res.json();
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          주문 목록
        </h1>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
        >
          {loading ? "조회중..." : "새로고침"}
        </button>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading && orders.length === 0 && (
          <p className="text-center text-zinc-500 py-12">주문을 불러오는 중...</p>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-zinc-500 py-12">
            최근 24시간 내 주문이 없습니다.
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.productOrderId}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {order.buyerName}
              </span>
              <span className="text-xs text-zinc-500">
                {formatDate(order.orderDate)}
              </span>
            </div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {order.productName}
              <span className="ml-1 text-zinc-500">x{order.quantity}</span>
            </div>
            <div className="text-xs text-zinc-500 truncate">{order.address}</div>
          </div>
        ))}
      </main>
    </div>
  );
}
