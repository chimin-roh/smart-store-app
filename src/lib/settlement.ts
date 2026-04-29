import type { CategorizedOrders } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type BucketOffset = 0 | 1 | 2 | 3 | 4;

export interface SettlementBucket {
  dateStr: string;
  offset: BucketOffset;
  total: number;
}

export interface SettlementSummary {
  buckets: SettlementBucket[];
  rest: number;
  grandTotal: number;
}

const EMPTY_BUCKETS = (today: Date): SettlementBucket[] =>
  ([0, 1, 2, 3, 4] as BucketOffset[]).map((offset) => ({
    offset,
    dateStr: toLocalDateStr(new Date(today.getTime() + offset * DAY_MS)),
    total: 0,
  }));

/**
 * Sums each visible item's settleAmount, bucketed by expectedSettleDate.
 * - 5 buckets: today, +1, +2, +3, +4 (always present, even if 0)
 * - rest: orders settling outside the 5-day window (past or beyond +4)
 * - grandTotal: sum of all visible items.settleAmount = buckets sum + rest
 */
export function computeSettlementBuckets(
  data: CategorizedOrders | null,
  today: Date,
): SettlementSummary {
  const buckets = EMPTY_BUCKETS(today);
  if (data === null) {
    return { buckets, rest: 0, grandTotal: 0 };
  }

  const indexByDateStr = new Map<string, number>();
  buckets.forEach((b, i) => indexByDateStr.set(b.dateStr, i));

  let rest = 0;
  let grandTotal = 0;

  const allCards = [...data.핀버튼, ...data.스티커, ...data.복합주문];
  for (const card of allCards) {
    for (const item of card.items) {
      const amount = item.settleAmount;
      if (!amount) continue;
      grandTotal += amount;
      const idx = indexByDateStr.get(item.expectedSettleDate);
      if (idx !== undefined) {
        buckets[idx].total += amount;
      } else {
        rest += amount;
      }
    }
  }

  return { buckets, rest, grandTotal };
}
