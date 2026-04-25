import type { GroupedOrder, CategorizedOrders } from "@/lib/types";

/**
 * UI에 표시되는 상품명 — search haystack과 OrderCard 렌더링이 동일한 소스를 쓰도록 통일.
 * "주문제작"을 포함하는 productName은 화면에 "주문제작" 또는 "주문제작 원형"으로만 표시되므로
 * 숨겨진 텍스트가 검색에 걸리지 않게 잘라낸다.
 */
export function visibleProductLabel(productName: string): string {
  if (productName.includes("주문제작")) {
    return productName.includes("원형") ? "주문제작 원형" : "주문제작";
  }
  return productName;
}

export function tokenize(query: string): string[] {
  return query
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function cardMatches(card: GroupedOrder, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const haystack = [
    card.buyerName,
    card.buyerId,
    ...card.items.flatMap((i) => [
      visibleProductLabel(i.productName),
      i.productOption,
    ]),
  ]
    .join(" ")
    .normalize("NFC")
    .toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

export function filterCategorized(
  data: CategorizedOrders | null,
  tokens: string[],
): { filtered: CategorizedOrders | null; total: number } {
  if (data === null) return { filtered: null, total: 0 };
  if (tokens.length === 0) {
    const total =
      data.핀버튼.length + data.스티커.length + data.복합주문.length;
    return { filtered: data, total };
  }
  const 핀버튼 = data.핀버튼.filter((c) => cardMatches(c, tokens));
  const 스티커 = data.스티커.filter((c) => cardMatches(c, tokens));
  const 복합주문 = data.복합주문.filter((c) => cardMatches(c, tokens));
  const total = 핀버튼.length + 스티커.length + 복합주문.length;
  return { filtered: { 핀버튼, 스티커, 복합주문 }, total };
}
