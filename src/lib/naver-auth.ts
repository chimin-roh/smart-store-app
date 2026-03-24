import bcrypt from "bcryptjs";
import type { NaverTokenResponse } from "./types";

let _configCache: { id: string; secret: string } | null = null;
function getConfig() {
  if (_configCache) return _configCache;
  const id = process.env.NAVER_CLIENT_ID ?? "";
  const secret = process.env.NAVER_CLIENT_SECRET ?? "";
  if (id && secret) {
    _configCache = { id, secret };
    return _configCache;
  }
  // 로컬 개발: config.ts fallback (Vercel에서는 환경변수 사용)
  try {
    const config = require("./config");
    _configCache = { id: config.NAVER_CLIENT_ID, secret: config.NAVER_CLIENT_SECRET };
  } catch {
    _configCache = { id, secret };
  }
  return _configCache;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function generateSignature(
  clientId: string,
  clientSecret: string,
  timestamp: number,
): string {
  const password = `${clientId}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, clientSecret);
  return Buffer.from(hashed).toString("base64");
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const { id: clientId, secret: clientSecret } = getConfig();
  const timestamp = Date.now();
  const signature = generateSignature(clientId, clientSecret, timestamp);

  const body = new URLSearchParams({
    client_id: clientId,
    timestamp: String(timestamp),
    client_secret_sign: signature,
    grant_type: "client_credentials",
    type: "SELF",
  });

  const res = await fetch(
    "https://api.commerce.naver.com/external/v1/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver auth failed: ${res.status} ${text}`);
  }

  const data: NaverTokenResponse = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}
