import { readdir } from "fs/promises";
import { join } from "path";

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
