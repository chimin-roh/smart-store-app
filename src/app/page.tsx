"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  CategorizedOrders,
  GroupedOrder,
  OrderCategory,
  CompletionState,
} from "@/lib/types";

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

const SECTIONS: { key: OrderCategory; label: string; color: string }[] = [
  { key: "핀버튼", label: "핀버튼", color: "bg-blue-500" },
  { key: "스티커", label: "스티커", color: "bg-green-500" },
  { key: "복합주문", label: "복합주문", color: "bg-purple-500" },
];

function OrderCard({
  order,
  completions,
  onToggle,
}: {
  order: GroupedOrder;
  completions: CompletionState;
  onToggle: (productOrderId: string) => void;
}) {
  const allDone = order.items.every((item) => completions[item.productOrderId]);

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 space-y-2 shadow-sm ${
        allDone
          ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {order.buyerName}
        </span>
        <span className="text-xs text-zinc-500">
          {formatDate(order.orderDate)}
        </span>
      </div>
      <div className="space-y-1.5">
        {order.items.map((item) => {
          const done = !!completions[item.productOrderId];
          return (
            <div
              key={item.productOrderId}
              className="flex items-start gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => onToggle(item.productOrderId)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 accent-zinc-600"
              />
              <div
                className={
                  done
                    ? "line-through opacity-40"
                    : "text-zinc-700 dark:text-zinc-300"
                }
              >
                {item.productName.includes("주문제작") ? (
                  <span>
                    주문제작
                    {item.productName.includes("원형") ? " 원형" : ""}
                  </span>
                ) : (
                  <span>{item.productName}</span>
                )}
                <span className="ml-1 font-medium text-zinc-900 dark:text-zinc-100">
                  x{item.quantity}
                </span>
                {item.productOption && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {item.productOption}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<CategorizedOrders | null>(null);
  const [completions, setCompletions] = useState<CompletionState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, completionsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/completions"),
      ]);
      if (!ordersRes.ok) throw new Error("주문 조회 실패");
      const ordersJson = await ordersRes.json();
      if (ordersJson.error) throw new Error(ordersJson.error);
      setData(ordersJson);
      if (completionsRes.ok) {
        setCompletions(await completionsRes.json());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleCompletion = useCallback(
    async (productOrderId: string) => {
      const newValue = !completions[productOrderId];
      // 낙관적 업데이트
      setCompletions((prev) => {
        const next = { ...prev };
        if (newValue) {
          next[productOrderId] = true;
        } else {
          delete next[productOrderId];
        }
        return next;
      });
      // 서버 저장
      try {
        const res = await fetch("/api/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productOrderId, completed: newValue }),
        });
        if (res.ok) {
          setCompletions(await res.json());
        }
      } catch {
        // 실패 시 되돌리기
        setCompletions((prev) => {
          const next = { ...prev };
          if (!newValue) {
            next[productOrderId] = true;
          } else {
            delete next[productOrderId];
          }
          return next;
        });
      }
    },
    [completions],
  );

  const totalCount = data
    ? data.핀버튼.length + data.스티커.length + data.복합주문.length
    : 0;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
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

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {loading && !data && (
          <p className="text-center text-zinc-500 py-12">
            주문을 불러오는 중...
          </p>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && totalCount === 0 && (
          <p className="text-center text-zinc-500 py-12">
            최근 24시간 내 주문이 없습니다.
          </p>
        )}

        {data &&
          SECTIONS.map(({ key, label, color }) => {
            const orders = data[key];
            if (orders.length === 0) return null;
            return (
              <section key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {label}
                    <span className="ml-1 text-zinc-400 font-normal">
                      ({orders.length})
                    </span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      completions={completions}
                      onToggle={toggleCompletion}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </main>
    </div>
  );
}
