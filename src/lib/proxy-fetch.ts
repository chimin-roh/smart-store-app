import { HttpsProxyAgent } from "https-proxy-agent";
import nodeFetch from "node-fetch";

const PROXY_URL =
  process.env.NOBLE_PROXY_URL ??
  "https://noble:fp_e1d0e1952942277a@p-5c60fbef.noble-ip.com:3129";

const agent = new HttpsProxyAgent(PROXY_URL);

export async function proxyFetch(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  const res = await nodeFetch(url, {
    ...init,
    agent,
  });
  return res;
}
