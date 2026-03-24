import { proxyFetch } from "@/lib/proxy-fetch";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 프록시 경유 IP 확인
    const proxyRes = await proxyFetch("https://api.ipify.org?format=json");
    const proxyData = await proxyRes.json();

    // 직접 호출 IP 확인
    const directRes = await fetch("https://api.ipify.org?format=json");
    const directData = await directRes.json();

    return Response.json({
      proxyIp: proxyData.ip,
      directIp: directData.ip,
      isVercel: !!process.env.VERCEL,
    });
  } catch (error) {
    return Response.json({
      error: String(error),
      isVercel: !!process.env.VERCEL,
    });
  }
}
