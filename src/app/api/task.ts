import { decompress } from "@/app/utils/vendor-CxthA9A1.mjs";
import dotenv from "dotenv";
import { translate } from "@/app/translate/translate.mjs";

if (!process.env.NETLIFY) {
  dotenv.config();
}

// 资源获取函数
export async function* fetchTranscript(episodeId: string) {
  try {
    yield { status: "start" };

    console.log(`🔁 Starting resource fetch for episode ${episodeId}`);
    const metadata = await downloadEpisodeMetadata(episodeId);
    yield { status: "metadata" };

    console.log(`🔁 Downloading transcript for episode ${episodeId}`);
    const transcriptId = metadata.transcription.id;
    const transcript = await downloadTranscript(episodeId, transcriptId);
    yield { status: "transcript" };

    console.log(`🔁 Translating transcript for episode ${episodeId}`);
    const content = transcript.text.map(({ word }: any) => word).join(" ");
    const translation = await translate(content);
    yield { status: "translate" };

    // 将翻译结果与原始句子合并
    const finalTranscript = mergeTranscript(transcript.text, translation);
    yield { status: "postprocess" };

    const manifest = {
      id: episodeId,
      title: metadata.title,
      description: metadata.description,
      url: metadata.url,
      logo: metadata.seriesLogoUrl,
      transcript: finalTranscript,
    };

    console.log(`Resource fetch completed for episode ${episodeId}`);
    return { status: "completed", data: manifest };
  } catch (error) {
    console.error(`Error fetching transcript for episode ${episodeId}:`, error);
    return { status: "failed", error };
  }
}

// 下载episode数据
async function downloadEpisodeMetadata(episodeId: string) {
  const url = `https://backend.podscribe.ai/api/episode?id=${episodeId}`;
  const response = await fetch(url);
  const data = await response.json();
  return decompress(data);
}

// 下载字幕文件
async function downloadTranscript(
  episodeId: string,
  transcriptVersionReqId: string
) {
  const url = `https://backend.podscribe.ai/api/episode/${episodeId}/transcription?transcriptVersionReqId=${transcriptVersionReqId}`;
  const response = await fetch(url);
  const data = await response.json();
  return decompress(data);
}

function mergeTranscript(text: any[], translation: any[]) {
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