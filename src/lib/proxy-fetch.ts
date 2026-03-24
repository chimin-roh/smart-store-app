import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";

const PROXY_URL =
  process.env.NOBLE_PROXY_URL ??
  "https://noble:fp_e1d0e1952942277a@p-5c60fbef.noble-ip.com:3129";

const isVercel = !!process.env.VERCEL;

export async function proxyFetch(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  if (isVercel) {
    // Vercel: Noble IP 프록시 경유
    const agent = new HttpsProxyAgent(PROXY_URL);
    const res = await nodeFetch(url, { ...init, agent });
    return res;
  }
  // 로컬: 프록시 없이 직접 호출
  const res = await fetch(url, init);
  return res;
}
