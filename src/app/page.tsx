"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CategorizedOrders,
  GroupedOrder,
  OrderCategory,
  CompletionState,
  BuyerImages,
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

function ImageGrid({
  images,
  buyerName,
  onDelete,
}: {
  images: string[];
  buyerName: string;
  onDelete: (buyerName: string, filename: string) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (filename: string) => {
    longPressTimer.current = setTimeout(() => {
      setDeleteTarget(filename);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
      {deleteTarget && (
        <div className="col-span-2 flex items-center justify-between bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          <span className="text-sm text-red-700 dark:text-red-300">
            이미지를 삭제할까요?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(buyerName, deleteTarget);
                setDeleteTarget(null);
              }}
              className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white"
            >
              삭제
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1 text-xs font-medium rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              취소
            </button>
          </div>
        </div>
      )}
      {images.map((filename) => (
        <img
          key={filename}
          src={`/api/images/${encodeURIComponent(buyerName)}/${encodeURIComponent(filename)}`}
          alt={filename}
          className={`w-full h-32 object-cover rounded-lg ${deleteTarget === filename ? "ring-2 ring-red-500 opacity-50" : ""}`}
          loading="lazy"
          onTouchStart={() => handleTouchStart(filename)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={() => handleTouchStart(filename)}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  completions,
  onToggle,
  images,
  expanded,
  onCardClick,
  onAddImage,
  onDeleteImage,
  cardRef,
}: {
  order: GroupedOrder;
  completions: CompletionState;
  onToggle: (productOrderId: string) => void;
  images: string[];
  expanded: boolean;
  onCardClick: () => void;
  onAddImage: (buyerName: string) => void;
  onDeleteImage: (buyerName: string, filename: string) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const allDone = order.items.every(
    (item) => completions[item.productOrderId],
  );
  const [showAddPopup, setShowAddPopup] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAddPopup(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-white dark:bg-zinc-900 rounded-xl border p-4 space-y-2 shadow-sm ${
        allDone
          ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {showAddPopup && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-zinc-800 text-white text-sm rounded-lg shadow-lg overflow-hidden">
            <button
              className="px-4 py-2.5 hover:bg-zinc-700 w-full text-left"
              onClick={() => {
                setShowAddPopup(false);
                onAddImage(order.buyerName);
              }}
            >
              이미지 추가
            </button>
            <button
              className="px-4 py-2.5 hover:bg-zinc-700 w-full text-left border-t border-zinc-700"
              onClick={() => setShowAddPopup(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onCardClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {order.buyerName}
        </span>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
              {images.length}장
            </span>
          )}
          <span className="text-xs text-zinc-500">
            {formatDate(order.orderDate)}
          </span>
          {images.length > 0 && (
            <span
              className={`text-xs text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          )}
        </div>
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
      {expanded && images.length > 0 && (
        <ImageGrid
          images={images}
          buyerName={order.buyerName}
          onDelete={onDeleteImage}
        />
      )}
    </div>
  );
}

function GalleryView({
  images,
  onClose,
  onNavigate,
}: {
  images: BuyerImages;
  onClose: () => void;
  onNavigate: (buyerName: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          갤러리
        </h1>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          닫기
        </button>
      </header>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {Object.entries(images).map(([buyerName, files]) => (
          <section key={buyerName}>
            <button
              onClick={() => onNavigate(buyerName)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2"
            >
              {buyerName}
            </button>
            <div className="grid grid-cols-3 gap-2">
              {files.map((filename) => (
                <img
                  key={filename}
                  src={`/api/images/${encodeURIComponent(buyerName)}/${encodeURIComponent(filename)}`}
                  alt={filename}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                  loading="lazy"
                  onClick={() => onNavigate(buyerName)}
                />
              ))}
            </div>
          </section>
        ))}
        {Object.keys(images).length === 0 && (
          <p className="text-center text-zinc-500 py-12">
            도안 이미지가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<CategorizedOrders | null>(null);
  const [completions, setCompletions] = useState<CompletionState>({});
  const [images, setImages] = useState<BuyerImages>({});
  const [expandedOrders, setExpandedOrders] = useState<
    Record<string, boolean>
  >({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const orderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addImageBuyerRef = useRef<string>("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem("completions");
      if (stored) setCompletions(JSON.parse(stored));

      const [ordersRes, imagesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/images"),
      ]);
      if (!ordersRes.ok) throw new Error("주문 조회 실패");
      const ordersJson = await ordersRes.json();
      if (ordersJson.error) throw new Error(ordersJson.error);
      setData(ordersJson);

      if (imagesRes.ok) {
        setImages(await imagesRes.json());
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

  const toggleExpand = useCallback((buyerName: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [buyerName]: !prev[buyerName],
    }));
  }, []);

  const handleAddImage = useCallback((buyerName: string) => {
    addImageBuyerRef.current = buyerName;
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const buyer = addImageBuyerRef.current;
      if (!file || !buyer) return;

      const formData = new FormData();
      formData.append("buyer", buyer);
      formData.append("file", file);

      try {
        const res = await fetch("/api/images", { method: "POST", body: formData });
        if (res.ok) {
          // 이미지 목록 새로고침
          const imagesRes = await fetch("/api/images");
          if (imagesRes.ok) setImages(await imagesRes.json());
          // 해당 카드 확장
          setExpandedOrders((prev) => ({ ...prev, [buyer]: true }));
        }
      } catch {
        // ignore
      }
      // file input 초기화
      e.target.value = "";
    },
    [],
  );

  const handleDeleteImage = useCallback(
    async (buyerName: string, filename: string) => {
      try {
        const res = await fetch("/api/images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyer: buyerName, filename }),
        });
        if (res.ok) {
          const imagesRes = await fetch("/api/images");
          if (imagesRes.ok) setImages(await imagesRes.json());
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  const navigateToOrder = useCallback((buyerName: string) => {
    setGalleryOpen(false);
    setExpandedOrders((prev) => ({ ...prev, [buyerName]: true }));
    setTimeout(() => {
      orderRefs.current[buyerName]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, []);

  const totalCount = data
    ? data.핀버튼.length + data.스티커.length + data.복합주문.length
    : 0;

  const hasImages = Object.keys(images).length > 0;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      {galleryOpen && (
        <GalleryView
          images={images}
          onClose={() => setGalleryOpen(false)}
          onNavigate={navigateToOrder}
        />
      )}

      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          주문 목록
        </h1>
        <div className="flex items-center gap-2">
          {hasImages && (
            <button
              onClick={() => setGalleryOpen(true)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-500 text-white"
            >
              갤러리
            </button>
          )}
          <button
            onClick={loadOrders}
            disabled={loading}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-50"
          >
            {loading ? "조회중..." : "새로고침"}
          </button>
        </div>
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
                      key={order.orderId}
                      order={order}
                      completions={completions}
                      onToggle={toggleCompletion}
                      images={images[order.buyerName] ?? []}
                      expanded={!!expandedOrders[order.buyerName]}
                      onCardClick={() => toggleExpand(order.buyerName)}
                      onAddImage={handleAddImage}
                      onDeleteImage={handleDeleteImage}
                      cardRef={(el) => {
                        orderRefs.current[order.buyerName] = el;
                      }}
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
