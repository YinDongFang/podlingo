import { decompress } from "../utils/vendor-CxthA9A1";
import { translate } from "./translate";
import logger from "../utils/logger";

// 资源获取函数
export async function* fetchTranscript(episodeId: string) {
  try {
    yield { status: "start" };

    logger.help(`Starting resource fetch for episode ${episodeId}`);
    const metadata = await downloadEpisodeMetadata(episodeId);
    yield { status: "metadata" };
    logger.info(metadata);

    logger.help(`Downloading transcript for episode ${episodeId}`);
    const transcriptId = metadata.transcription.id;
    const transcript = await downloadTranscript(episodeId, transcriptId);
    yield { status: "transcript" };
    logger.info(transcript.text.map(({ word }: any) => word).join(" "));

    logger.help(`Translating transcript for episode ${episodeId}`);
    const content = transcript.text.map(({ word }: any) => word);
    const translation = await translate(content);
    let translationResult: any;
    for await (const status of translation) {
      translationResult = status;
      yield { status: "translate", ...status };
    }

    // 将翻译结果与原始句子合并
    const finalTranscript = mergeTranscript(transcript.text, translationResult);
    yield { status: "postprocess" };

    const manifest = {
      id: episodeId,
      title: metadata.title,
      description: metadata.description,
      url: metadata.url,
      logo: metadata.seriesLogoUrl,
      transcript: finalTranscript,
    };

    logger.help(`Resource fetch completed for episode ${episodeId}`);
    yield { status: "completed", data: manifest };
  } catch (error) {
    logger.error(`Error fetching transcript for episode ${episodeId}:`, error);
    yield { status: "failed", error };
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
