const PROXY_URL =
  process.env.NOBLE_PROXY_URL ??
  "https://noble:fp_e1d0e1952942277a@p-5c60fbef.noble-ip.com:3129";

const isVercel = !!process.env.VERCEL;

let dispatcher: any = undefined;
if (isVercel) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ProxyAgent } = require("undici");
  dispatcher = new ProxyAgent(PROXY_URL);
}

export async function proxyFetch(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  const res = await fetch(url, {
    ...init,
    ...(dispatcher ? { dispatcher } : {}),
  } as any);
  return res;
}
