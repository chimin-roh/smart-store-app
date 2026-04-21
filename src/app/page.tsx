"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  CategorizedOrders,
  GroupedOrder,
  OrderCategory,
  CompletionState,
  NicknameState,
} from "@/lib/types";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${DAY_NAMES[d.getDay()]}`;
}

function formatDeadline(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()} ${DAY_NAMES[date.getDay()]} 마감`;
}

const SECTIONS: { key: OrderCategory; label: string; color: string }[] = [
  { key: "핀버튼", label: "핀버튼", color: "bg-blue-500" },
  { key: "스티커", label: "스티커", color: "bg-green-500" },
  { key: "복합주문", label: "복합주문", color: "bg-purple-500" },
];

function DatePicker({
  selected,
  onSelect,
  onClear,
  onClose,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selected) return new Date(selected + "T00:00:00");
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-4 w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ◀
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {year}년 {month + 1}월
          </span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ▶
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className="py-1 text-zinc-400 font-medium">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const dateStr = toDateStr(day);
            const isSelected = dateStr === selected;
            const isToday = dateStr === todayStr;
            return (
              <button
                key={day}
                onClick={() => onSelect(dateStr)}
                className={`py-1.5 rounded-lg text-sm ${
                  isSelected
                    ? "bg-red-500 text-white font-bold"
                    : isToday
                      ? "bg-zinc-100 dark:bg-zinc-700 font-semibold text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selected && (
          <button
            onClick={onClear}
            className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
          >
            마감일 삭제
          </button>
        )}
      </div>
    </div>
  );
}

function NicknameEditor({
  initial,
  buyerName,
  onSave,
  onClose,
}: {
  initial: string;
  buyerName: string;
  onSave: (nickname: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const save = () => onSave(value.trim());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl p-4 w-72 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {buyerName}
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            닉네임 설정
          </p>
        </div>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          placeholder="닉네임 입력 (비우면 삭제)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
          >
            취소
          </button>
          <button
            onClick={save}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  completions,
  onToggle,
  deadline,
  onSetDeadline,
  nickname,
  onSetNickname,
}: {
  order: GroupedOrder;
  completions: CompletionState;
  onToggle: (productOrderId: string) => void;
  deadline?: string;
  onSetDeadline: (buyerId: string, date: string | null) => void;
  nickname?: string;
  onSetNickname: (buyerId: string, nickname: string) => void;
}) {
  const allDone = order.items.every(
    (item) => completions[item.productOrderId],
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 space-y-2 shadow-sm ${
        allDone
          ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
          <span>{order.buyerName}</span>
          {nickname && (
            <span className="text-xs font-normal text-blue-500">
              ({nickname})
            </span>
          )}
          <span className="ml-1 text-xs font-normal text-zinc-400">
            {order.buyerId}
          </span>
          <button
            onClick={() => setNicknameOpen(true)}
            className="ml-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="닉네임 편집"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M11.5 1.5l3 3-9 9H2.5v-3z" />
              <line x1="9.5" y1="3.5" x2="12.5" y2="6.5" />
            </svg>
          </button>
        </span>
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">
              {formatDate(order.orderDate)}
            </span>
            <button
              onClick={() => setCalendarOpen(true)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="1" y="3" width="14" height="12" rx="1.5" />
                <line x1="1" y1="7" x2="15" y2="7" />
                <line x1="4" y1="1" x2="4" y2="5" />
                <line x1="12" y1="1" x2="12" y2="5" />
              </svg>
            </button>
          </div>
          {deadline && (
            <p className="text-xs text-red-500 font-medium mt-0.5">
              {formatDeadline(deadline)}
            </p>
          )}
        </div>
      </div>
      {calendarOpen && (
        <DatePicker
          selected={deadline ?? null}
          onSelect={(date) => {
            onSetDeadline(order.buyerId, date);
            setCalendarOpen(false);
          }}
          onClear={() => {
            onSetDeadline(order.buyerId, null);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      )}
      {nicknameOpen && (
        <NicknameEditor
          initial={nickname ?? ""}
          buyerName={order.buyerName}
          onSave={(next) => {
            onSetNickname(order.buyerId, next);
            setNicknameOpen(false);
          }}
          onClose={() => setNicknameOpen(false)}
        />
      )}
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
  const [deadlines, setDeadlines] = useState<Record<string, string>>({});
  const [nicknames, setNicknames] = useState<NicknameState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("completions");
      if (stored) setCompletions(JSON.parse(stored));

      const storedDeadlines = localStorage.getItem("deadlines");
      if (storedDeadlines) setDeadlines(JSON.parse(storedDeadlines));

      const storedNicknames = localStorage.getItem("nicknames");
      if (storedNicknames) setNicknames(JSON.parse(storedNicknames));

      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("주문 조회 실패");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleCompletion = useCallback((productOrderId: string) => {
    setCompletions((prev) => {
      const next = { ...prev };
      if (next[productOrderId]) {
        delete next[productOrderId];
      } else {
        next[productOrderId] = true;
      }
      localStorage.setItem("completions", JSON.stringify(next));
      return next;
    });
  }, []);

  const setDeadline = useCallback((buyerId: string, date: string | null) => {
    setDeadlines((prev) => {
      const next = { ...prev };
      if (date) {
        next[buyerId] = date;
      } else {
        delete next[buyerId];
      }
      localStorage.setItem("deadlines", JSON.stringify(next));
      return next;
    });
  }, []);

  const setNickname = useCallback((buyerId: string, nickname: string) => {
    setNicknames((prev) => {
      const next = { ...prev };
      if (nickname) {
        next[buyerId] = nickname;
      } else {
        delete next[buyerId];
      }
      localStorage.setItem("nicknames", JSON.stringify(next));
      return next;
    });
  }, []);

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
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 space-y-3">
            <p>{error}</p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/ip");
                  const data = await res.json();
                  const ip = data.directIp;
                  if (ip) {
                    await navigator.clipboard.writeText(ip);
                    alert(`IP 복사됨: ${ip}`);
                    window.open(
                      "https://apicenter.commerce.naver.com/ko/member/home",
                      "_blank",
                    );
                  } else {
                    alert("IP를 가져올 수 없습니다.");
                  }
                } catch {
                  alert("IP 조회 실패");
                }
              }}
              className="w-full py-2 text-sm font-medium rounded-lg bg-red-600 text-white"
            >
              IP 복사 후 네이버 API센터 열기
            </button>
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
                      key={order.buyerId || order.orderId}
                      order={order}
                      completions={completions}
                      onToggle={toggleCompletion}
                      deadline={deadlines[order.buyerId]}
                      onSetDeadline={setDeadline}
                      nickname={nicknames[order.buyerId]}
                      onSetNickname={setNickname}
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
