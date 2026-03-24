import bcrypt from "bcryptjs";
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from "./config";
import type { NaverTokenResponse } from "./types";

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

  const clientId = process.env.NAVER_CLIENT_ID ?? NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET ?? NAVER_CLIENT_SECRET;
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
