import OpenAI from "openai";
import dotenv from "dotenv";
import { load } from "js-yaml";
import { append } from "./output.js";
import { Statistics } from "./statistics.js";
import fs from "fs";
import path from "path";

if (!process.env.NETLIFY) {
  dotenv.config();
}

const prompt = `- 你是一名中英翻译，逐句翻译给出的文本
- 超出CET4难度的单词、生僻单词、英语俚语、英语口语化短语、专业术语需要给出具体的解释和使用场景
- 返回全部完整的句子翻译，不要缺失遗漏
- 以yaml格式返回，没有关键字时不返回keyword字段，示例如下：
\`\`\`yaml
- en: 'Yes, absolutely.'
  zh: '当然会啊。'
- en: 'Aubrey, did you use to cram for tests?'
  zh: 'Aubrey，你以前会临时抱佛脚吗？'
  keyword:
    - word: 'cram'
      explanation: '俚语，指考试前突击学习，临时抱佛脚'
      usages:
        - en: 'I had to cram all night for the chemistry exam.'
          zh: '我不得不通宵突击化学考试'
\`\`\``;

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL,
});

export async function translate(sentences, chunkSize = 100, dir) {
  const result = [];
  const statistics = new Statistics(sentences.length, chunkSize);

  for (let i = 0; i < sentences.length; i += chunkSize) {
    const sentenceChunk = sentences.slice(i, i + chunkSize);
    let parsedSentences = [];
    let content = "";

    statistics.chunk();

    const chatCompletion = await openai.chat.completions.create(
      {
        model: process.env.LLM_MODEL,
        stream: true,
        max_completion_tokens: 10000,
        thinking: { type: "disabled" },
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: JSON.stringify(sentenceChunk, null, 2),
          },
        ],
      },
      { headers: { "cf-aig-authorization": process.env.CLOUDFLARE_TOKEN } }
    );

    let yamlContent = "";
    for await (const chunk of chatCompletion) {
      const chunkContent = chunk.choices[0].delta.content || "";
      content += chunkContent;
      if (content.startsWith("- translation: ")) {
        yamlContent = content;
      } else {
        const prefix = "```yaml";
        const suffix = "```";
        const start = content.indexOf(prefix);
        if (start !== -1) {
          const end = content.lastIndexOf(suffix);
          if (end !== -1 && end !== start) {
            yamlContent = content.substring(start + prefix.length, end);
          } else {
            yamlContent = content.substring(start + prefix.length);
          }
        }
      }
      if (!yamlContent) continue;
      try {
        parsedSentences = load(yamlContent.replaceAll('"', "'")) || [];
      } catch (error) {
        continue;
      }
      statistics.update(parsedSentences.length);

      if (parsedSentences.length > 0) {
        const latestSentence = parsedSentences[parsedSentences.length - 1];
        if (latestSentence?.zh) {
          append(`📝 "${latestSentence.zh}"`);
          if (latestSentence.keyword?.length > 0)
            append(`🔑 包含 ${latestSentence.keyword.length} 个关键词解释`);
        }
      }
    }
    result.push(...parsedSentences);

    fs.writeFileSync(path.join(dir, `chunk_${i / chunkSize + 1}.txt`), content);
  }

  statistics.end(result.length);

  return result;
}
