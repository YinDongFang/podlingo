import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";
import { fetchTranscript } from "@/app/api/task";

const getDir = (episodeId: string) =>
  path.join(process.cwd(), "public", "episodes", episodeId);

const task = new Map<string, { status: string; data: any; error: any }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await params;

  try {
    if (task.has(episodeId)) {
      return NextResponse.json(task.get(episodeId));
    }

    const dir = getDir(episodeId);
    if (fs.existsSync(path.join(dir, "manifest.json"))) {
      const manifest = fs.readJsonSync(path.join(dir, "manifest.json"));
      return NextResponse.json({ status: "completed", data: manifest });
    }

    startTask(episodeId);

    return NextResponse.json({ status: "start" });
  } catch (error) {
    console.error("Error checking resource status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function startTask(episodeId: string) {
  const dir = getDir(episodeId);
  const result: any = await fetchTranscript(episodeId);
  for await (const status of result) {
    task.set(episodeId, status);
    if (status.status === "completed") {
      fs.ensureDirSync(dir);
      fs.writeJsonSync(path.join(dir, "manifest.json"), status.data);
      return;
    }
  }
}
