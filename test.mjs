import { decompress } from "./src/app/utils/vendor-CxthA9A1.mjs";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { translate } from "./src/app/translate/translate.mjs";

if (!process.env.NETLIFY) {
  dotenv.config();
}

const getDir = (episodeId) =>
  path.join(process.cwd(), "public", "episodes", episodeId);

// 资源获取函数
async function fetchTranscript(episodeId) {
  const dir = getDir(episodeId);
  fs.ensureDirSync(dir);
  fs.writeJsonSync(path.join(dir, "manifest.json"), { status: "fetching" });

  try {
    console.log(`🔁 Starting resource fetch for episode ${episodeId}`);
    const metadata = await downloadEpisodeMetadata(episodeId);
    fs.writeJsonSync(path.join(dir, "metadata.json"), metadata);

    console.log(`🔁 Downloading transcript for episode ${episodeId}`);
    const transcriptId = metadata.transcription.id;
    const transcript = await downloadTranscript(episodeId, transcriptId);
    fs.writeJsonSync(path.join(dir, "transcript.json"), transcript);

    console.log(`🔁 Translating transcript for episode ${episodeId}`);
    const content = transcript.text
      .map(({ word }) => word)
      .join(" ")
      .substring(0, 2000);
    fs.writeFileSync(path.join(dir, "transcript.txt"), content);
    const translation = await translate(content);

    // 将翻译结果与原始句子合并
    const finalTranscript = mergeTranscript(transcript.text, translation);

    const manifest = {
      id: episodeId,
      title: metadata.title,
      description: metadata.description,
      url: metadata.url,
      logo: metadata.seriesLogoUrl,
      transcript: finalTranscript,
      status: "completed",
    };

    fs.writeJsonSync(path.join(dir, "manifest.json"), manifest);
    console.log(`Resource fetch completed for episode ${episodeId}`);
  } catch (error) {
    console.error(`Error fetching transcript for episode ${episodeId}:`, error);
    fs.removeSync(path.join(dir, "manifest.json"));
    throw error;
  }
}

// 下载episode数据
async function downloadEpisodeMetadata(episodeId) {
  const url = `https://backend.podscribe.ai/api/episode?id=${episodeId}`;
  const response = await fetch(url);
  const data = await response.json();
  return decompress(data);
}

// 下载字幕文件
async function downloadTranscript(episodeId, transcriptVersionReqId) {
  const url = `https://backend.podscribe.ai/api/episode/${episodeId}/transcription?transcriptVersionReqId=${transcriptVersionReqId}`;
  const response = await fetch(url);
  const data = await response.json();
  return decompress(data);
}

function mergeTranscript(text, translation) {
  let index = 0;
  return translation.map((sentence) => {
    const result = {
      ...sentence,
      startTime: text[index].startTime,
    };
    let length = sentence.en.length;
    while (length > 0) {
      const word = text[index];
      length -= word.word.length;
      if (length > 0) length -= 1;
      index++;
    }
    result.endTime = text[index - 1].endTime;
    return result;
  });
}

fetchTranscript("135018264");
