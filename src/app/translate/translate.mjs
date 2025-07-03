import OpenAI from "openai";
import { Portkey } from "portkey-ai";
import dotenv from "dotenv";
import { append } from "./output.mjs";
import { Statistics } from "./statistics.mjs";
import { Parser } from "./parse.mjs";
import fs from "fs";

if (!process.env.NETLIFY) {
  dotenv.config();
}

const prompt = `- 你是一名中英翻译，逐句翻译给出的文本
- 超出CET4难度的单词、生僻单词、英语俚语、英语口语化短语、专业术语需要给出具体的解释和使用场景
- 返回全部完整的句子翻译，不要缺失遗漏
- 使用以下格式返回，没有关键字时不返回keyword，示例如下：
[sentence]
en: No, didn\'t.
zh: 不，没有
[sentence]
en: So these are pretty interchangeable, pretty synonymous.
zh: 所以这两个短语基本可以互换，是同义词
[keyword]
word: interchangeable
explanation: 可互換的、可交替的
usage_en: The parts in these two models of cars are interchangeable, which simplifies repairs.
usage_zh: 这些汽车零件可以互换，这使得维修变得更容易
[keyword]
word: synonymous
explanation: 同义的、同义词的。指不同词语可以互相替换而不改变句子的核心含义
usage_en: "Happy" and "joyful" are often considered synonymous.
usage_zh: “快乐的”和“愉快的”通常被认为是同义的。`;

// const openai = new OpenAI({
//   apiKey: process.env.API_KEY,
//   baseURL: process.env.BASE_URL,
// });

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
});

export async function translate(input) {
  const statistics = new Statistics(input.length);
  let result = [];
  let messages = [
    { role: "system", content: prompt },
    { role: "user", content: input },
  ];

  while (true) {
    // const chatCompletion = await openai.chat.completions.create(
    //   {
    //     model: process.env.LLM_MODEL,
    //     stream: true,
    //     max_tokens: 500,
    //     thinking: { type: "disabled" },
    //     messages,
    //   },
    //   { headers: { "cf-aig-authorization": process.env.CLOUDFLARE_TOKEN } }
    // );

    const chatCompletion = await portkey.chat.completions.create({
      stream: true,
      messages,
      model: process.env.LLM_MODEL,
    });

    let finish_reason;
    let buffer = [];
    let response = "";
    const parser = new Parser();
    for await (const chunk of chatCompletion) {
      const chunkContent = chunk.choices[0].delta.content || "";
      finish_reason = chunk.choices[0].finish_reason;
      response += chunkContent;

      parser.append(chunkContent);
      buffer = parser.get().sentences;
      const count = [...result, ...buffer]
        .filter((sentence) => sentence?.en)
        .reduce((count, { en }) => count + en.length + 1, -1);
      statistics.update(Math.max(count, 0));

      if (buffer.length > 0) {
        const latestSentence = buffer[buffer.length - 1];
        if (latestSentence?.zh) {
          append(`📝 "${latestSentence.zh}"`);
          if (latestSentence.keyword?.length > 0)
            append(`🔑 包含 ${latestSentence.keyword.length} 个关键词解释`);
        }
      }
    }

    if (finish_reason === "length") {
      result.push(...buffer.slice(0, -1));
    }
    if (finish_reason === "stop") {
      result.push(...buffer);
      break;
    }

    const endIndex = parser.get().lastIndex;
    messages.push(
      { role: "assistant", content: response.substring(0, endIndex) },
      { role: "user", content: "继续" }
    );
  }

  statistics.end();

  return result;
}
