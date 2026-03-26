import { readdir, mkdir, writeFile, unlink } from "fs/promises";
import { join, resolve } from "path";

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function getImageBaseDir() {
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

export async function GET() {
  const baseDir = getImageBaseDir();
  try {
    const folders = await readdir(baseDir, { withFileTypes: true }).catch(
      () => [],
    );
    const result: Record<string, string[]> = {};
    for (const entry of folders) {
      if (!entry.isDirectory()) continue;
      const files = await readdir(join(baseDir, entry.name));
      const images = files.filter((f) =>
        IMAGE_EXTENSIONS.has(f.slice(f.lastIndexOf(".")).toLowerCase()),
      );
      if (images.length > 0) result[entry.name] = images;
    }
    return Response.json(result);
  } catch {
    return Response.json({});
  }
}

export async function POST(request: Request) {
  const baseDir = getImageBaseDir();
  try {
    const formData = await request.formData();
    const buyer = formData.get("buyer") as string;
    const file = formData.get("file") as File;
    if (!buyer || !file) {
      return Response.json({ error: "buyer and file required" }, { status: 400 });
    }

    const dir = join(baseDir, buyer);
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(dir, file.name);
    await writeFile(filePath, buffer);

    return Response.json({ ok: true, filename: file.name });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const baseDir = getImageBaseDir();
  try {
    const { buyer, filename } = await request.json();
    if (!buyer || !filename) {
      return Response.json({ error: "buyer and filename required" }, { status: 400 });
    }
    const filePath = resolve(join(baseDir, buyer, filename));
    if (!filePath.startsWith(resolve(baseDir))) {
      return new Response("Forbidden", { status: 403 });
    }
    await unlink(filePath);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
