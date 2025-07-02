import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";

const getDir = (episodeId: string) =>
  path.join(process.cwd(), "public", "episodes", episodeId);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;

  try {
    const dir = getDir(episodeId);
    if (!fs.existsSync(path.join(dir, "manifest.json"))) {
      return NextResponse.json({ status: "fetching" });
    }
    const manifest = fs.readJsonSync(path.join(dir, "manifest.json"));
    return NextResponse.json(manifest);
  } catch (error) {
    console.error("Error checking resource status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
