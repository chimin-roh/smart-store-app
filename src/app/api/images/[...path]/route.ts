import { readFile, stat } from "fs/promises";
import { join, extname, resolve } from "path";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

function getImageBaseDir(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { IMAGE_BASE_DIR } = require("@/lib/config");
    return IMAGE_BASE_DIR as string;
  } catch {
    const { homedir } = require("os");
    const { join } = require("path");
    return join(homedir(), "storage/pictures/도안");
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const baseDir = getImageBaseDir();
  const filePath = resolve(join(baseDir, ...path));

  if (!filePath.startsWith(resolve(baseDir))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const ext = extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const buffer = await readFile(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
