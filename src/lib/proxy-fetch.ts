const PROXY_URL =
  process.env.NOBLE_PROXY_URL ??
  "https://noble:fp_e1d0e1952942277a@p-5c60fbef.noble-ip.com:3129";

const isVercel = !!process.env.VERCEL;

export async function proxyFetch(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  if (isVercel) {
    // Noble IP 공식 예제 방식 (node-fetch + hpagent)
    const nodeFetch = (await import("node-fetch")).default;
    const { HttpsProxyAgent } = await import("hpagent");
    const agent = new HttpsProxyAgent({
      keepAlive: true,
      proxy: PROXY_URL,
    });
    const res = await nodeFetch(url, { ...init, agent } as any);
    return res as any;
  }
  const res = await fetch(url, init);
  return res;
}
