import nodeFetch from "node-fetch";
import { HttpsProxyAgent } from "hpagent";

const PROXY_URL =
  process.env.NOBLE_PROXY_URL ??
  "http://noble:fp_e1d0e1952942277a@p-5c60fbef.noble-ip.com:3129";

const isVercel = !!process.env.VERCEL;

const agent = isVercel
  ? new HttpsProxyAgent({ keepAlive: true, proxy: PROXY_URL })
  : undefined;

export async function proxyFetch(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  if (isVercel) {
    const res = await nodeFetch(url, { ...init, agent });
    return res;
  }
  const res = await fetch(url, init);
  return res;
}
