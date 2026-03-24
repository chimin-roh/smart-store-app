import { loadCompletions, setCompletion } from "@/lib/completions";

export const dynamic = "force-dynamic";

export async function GET() {
  const completions = loadCompletions();
  return Response.json(completions);
}

export async function POST(request: Request) {
  const { productOrderId, completed } = await request.json();
  if (typeof productOrderId !== "string" || typeof completed !== "boolean") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const updated = setCompletion(productOrderId, completed);
  return Response.json(updated);
}
