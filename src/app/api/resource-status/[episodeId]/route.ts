import { NextRequest, NextResponse } from "next/server";
import { decompress } from "../../../utils/vendor-CxthA9A1.mjs";
import { customTolerantParseJSON } from "../../../utils/parse.js";
import fs from "fs-extra";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

if (!process.env.NETLIFY) {
  dotenv.config();
}

const openai = new OpenAI({
  apiKey: process.env.DOUBAO_TOKEN,
  baseURL: process.env.DOUBAO_API_ENDPOINT,
});

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
      fetchTranscript(episodeId);
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

// 资源获取函数
async function fetchTranscript(episodeId: string) {
  const dir = getDir(episodeId);
  fs.ensureDirSync(dir);
  fs.writeJsonSync(path.join(dir, "manifest.json"), { status: "fetching" });

  try {
    console.log(`🔁 Starting resource fetch for episode ${episodeId}`);
    const metadata = await downloadEpisodeMetadata(episodeId);

    console.log(`🔁 Downloading transcript for episode ${episodeId}`);
    const transcriptId = metadata.transcription.id;
    const { text } = await downloadTranscript(episodeId, transcriptId);

    console.log(`🔁 Processing transcript for episode ${episodeId}`);
    const transcript = processTranscript(text);

    console.log(`🔁 Translating transcript for episode ${episodeId}`);
    // 分片翻译，每500句翻译一次
    let translatedSentences: any[] = [];
    for (let i = 0; i < transcript.length; i += 100) {
      console.log(
        `🔁 Translating chunk ${i / 100 + 1} for episode ${episodeId}`
      );
      const sentences = transcript
        .slice(i, i + 100)
        .map((sentence) => sentence.text);
      const translatedSentencesChunk = await translateTranscript(sentences);
      translatedSentences.push(...translatedSentencesChunk);
    }
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

// 处理字幕文件
function processTranscript(words: any[]) {
  const sentences: any[] = [];
  let currentSentence = {
    text: "",
    startTime: 0,
    endTime: 0,
  };

  words.forEach((word: any, index: number) => {
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

// 翻译字幕（使用DeepSeek API）
async function translateTranscript(sentences: string[]) {
  let content = "";
  let parsedSentences: any[] = [];
  let startTime = Date.now();

  console.log(`🚀 开始翻译 ${sentences.length} 个句子...`);
  console.log(`⏰ 开始时间: ${new Date().toLocaleTimeString()}\n`);

  const chatCompletion = await openai.chat.completions.create(
    {
      model: process.env.LLM_MODEL,
      apiKey: process.env.DOUBAO_TOKEN,
      stream: true,
      max_completion_tokens: 10000,
      messages: [
        {
          role: "system",
          content: `- 你是一名中英翻译，逐句翻译给出的文本
- 超出CET6难度的单词、生僻单词、英语俚语、英语口语化短语、专业术语需要给出具体的解释和使用场景
- 已经做出详细解释的keyword在之后的句子中不需要重复处理
- 以json格式返回，示例如下：
\`\`\`json
[
  {
    translation: "我开始阅读，我知道有一种时髦的流行理论",
    keyword: [
      {
        word: "trendy",
        explanation:
          "意思是时尚的，流行的，通常指某个时期内非常受追捧的事物。带有"赶时髦"的意味",
        usages: [
          {
            en: "That new restaurant is very trendy right now.",
            zh: "那家新餐厅现在很时髦",
          },
        ],
      },
    ],
  },
]
\`\`\``,
        },
        { role: "user", content: JSON.stringify(sentences) },
      ],
    },
    // { headers: { "cf-aig-authorization": process.env.CLOUDFLARE_TOKEN } }
  );

  let latestSentence = undefined;
  for await (const chunk of chatCompletion) {
    console.log(chunk);
    const chunkContent = chunk.choices[0].message.content || "";
    content += chunkContent;

    // 尝试解析JSON
    try {
      // 查找JSON开始和结束位置
      const prefix = "```json";
      const jsonStart = content.indexOf(prefix);
      clear();

      if (jsonStart !== -1) {
        const jsonStr = content.substring(jsonStart + prefix.length);
        const parsed = customTolerantParseJSON(jsonStr);

        if (parsed && Array.isArray(parsed)) {
          parsedSentences = parsed;

          // 计算已完成的句子数量
          const completedCount = parsedSentences.length;

          // 计算进度和速度
          const progress = Math.round(
            (completedCount / sentences.length) * 100
          );
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed =
            completedCount > 0
              ? (completedCount / elapsedTime).toFixed(1)
              : "0";

          // 显示进度条
          const progressBar =
            "█".repeat(Math.floor(progress / 5)) +
            "░".repeat(20 - Math.floor(progress / 5));

          // 清除当前行并显示进度
          append(
            `📊 翻译进度: [${progressBar}] ${progress}% (${completedCount}/${sentences.length}) | ⚡ ${speed} 句/秒`
          );

          // 如果有新的完整句子，显示最新翻译
          if (completedCount > 0) {
            const currentSentence = parsedSentences[completedCount - 1];
            if (currentSentence.en && currentSentence.zh) {
              const keywordCount = currentSentence.keyword?.length || 0;
              latestSentence = { ...currentSentence, keywordCount };
            }

            append(`✅ 最新翻译 (${completedCount}/${sentences.length}):`);
            if (latestSentence) {
              append(`📝 "${latestSentence.en}"`);
              append(`🇨🇳 "${latestSentence.zh}"`);
              if (latestSentence.keywordCount > 0)
                append(`🔑 包含 ${latestSentence.keywordCount} 个关键词解释`);
            }
          }
        }
      }
    } catch (error) {
      // JSON解析失败，继续累积内容
      continue;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const avgSpeed = (parsedSentences.length / parseFloat(totalTime)).toFixed(1);

  console.log(`🎉 翻译完成！`);
  console.log(`📈 统计信息:`);
  console.log(` • 总句子数: ${parsedSentences.length}`);
  console.log(` • 总耗时: ${totalTime} 秒`);
  console.log(` • 平均速度: ${avgSpeed} 句/秒`);
  console.log(` • 完成时间: ${new Date().toLocaleTimeString()}`);

  // 返回解析后的句子数组
  return parsedSentences;
}

let lines = 0;
function append(content: string) {
  process.stdout.write(`\x1B[K${content}\n`);
  lines++;
}
function clear() {
  process.stdout.write(`\x1B[${lines}A`);
  lines = 0;
}


fetchTranscript("135018264")