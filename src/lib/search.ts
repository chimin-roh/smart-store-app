import type { GroupedOrder, CategorizedOrders } from "@/lib/types";

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
    ...card.items.map((i) => i.productName),
    ...card.items.map((i) => i.productOption),
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
