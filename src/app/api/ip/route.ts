export const dynamic = "force-dynamic";

export async function GET() {
  // 외부 서비스를 통해 이 서버의 공인 IP 확인
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  return Response.json({ serverIp: data.ip });
}
