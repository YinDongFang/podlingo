import { decompress } from "./src/app/utils/vendor-CxthA9A1.js";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { translate } from "./src/app/translate/translate.js";

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
    const { text } = await downloadTranscript(episodeId, transcriptId);

    console.log(`🔁 Processing transcript for episode ${episodeId}`);
    const transcript = processTranscript(text);
    fs.writeJsonSync(path.join(dir, "transcript.json"), transcript);

    console.log(`🔁 Translating transcript for episode ${episodeId}`);
    // 分片翻译，每500句翻译一次
    const sentences = transcript.map((sentence) => sentence.text);
    const translatedSentences = await translate(sentences, 100, dir);
    // 将翻译结果与原始句子合并
    const finalTranscript = transcript.map((originalSentence, index) => {
      const translatedSentence = translatedSentences[index];
      return { ...originalSentence, ...translatedSentence };
    });

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

// 处理字幕文件
function processTranscript(words) {
  const sentences = [];
  let currentSentence = {
    text: "",
    startTime: 0,
    endTime: 0,
  };

  words.forEach((word, index) => {
    if (index === 0) {
      currentSentence.startTime = word.startTime;
    }

    currentSentence.text += word.word + " ";

    // 判断句子结束条件：句号、问号、感叹号，或者下一个词开始时间间隔超过1秒
    const isEndOfSentence = word.word.match(/[.!?]$/);
    const nextWord = words[index + 1];
    const timeGap = nextWord ? nextWord.startTime - word.endTime : 0;

    if (isEndOfSentence || timeGap > 1 || index === words.length - 1) {
      currentSentence.endTime = word.endTime;
      currentSentence.text = currentSentence.text.trim();
      currentSentence.index = sentences.length;
      sentences.push(currentSentence);

      if (nextWord) {
        currentSentence = {
          text: "",
          startTime: nextWord.startTime,
          endTime: 0,
        };
      }
    }
  });

  return sentences;
}

fetchTranscript("135018264");