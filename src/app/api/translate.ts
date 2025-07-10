import { Portkey } from "portkey-ai";
import { load } from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

const prompt = `## Goals
- 根据语义断句，逗号也可以断句，逐句翻译给出的文本，每句一定不能超过20个单词！
- 注意判断上下文，避免内容缺失，不要省略任何单词
- 返回的en字段必须和原文保持完全一致，不能缺失任何字母或标点符号
- 注意原文中的标点符号，不要翻译标点符号。英文逗号不要翻译为中文逗号
- CET4以上难度的单词、生僻单词、英语俚语、英语口语化短语、专业术语需要给出具体的解释和使用场景
## OutputFormat:
- 输出标准yaml格式，以双引号表示字符串标量，字符串中是的引号为单引号，如果是双引号，需要添加转义符
- 不需要返回"\`\`\`yaml"和最后的"\`\`\`"，直接返回yaml内容。参考如下：

- en: "No, didn't."
  zh: "不，没有"
- en: "So these are pretty interchangeable, pretty synonymous."
  zh: "所以这两个短语基本可以互换，是同义词"
  keyword:
    - word: "interchangeable"
      explanation: "可互換的、可交替的"
      en: "The parts in these two models of cars are interchangeable, which simplifies repairs."
      zh: "这些汽车零件可以互换，这使得维修变得更容易"
    - word: "synonymous"
      explanation: "同义的、同义词的。指不同词语可以互相替换而不改变句子的核心含义"
      en: "'Happy' and 'joyful' are often considered synonymous."
      zh: "“快乐的”和“愉快的”通常被认为是同义的。"`;

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
});

function parse(content: string) {
  const yaml = content.replace("```yaml", "").replace("```", "");
  return load(yaml) as any[];
}

function match(input: string, parsedResult: any[]): boolean {
  let start = 0;
  for (const sentence of parsedResult) {
    const en = sentence.en.toLocaleLowerCase().trim();
    const inputSentence = input.substring(start, start + en.length);
    if (en === inputSentence) {
      start += en.length;
    } else {
      logger.help(
        `match failed.\ninput: ${inputSentence}\nparsedResult: ${en}`
      );
      return false;
    }
  }
  return true;
}

async function tryCompletion(
  input: string,
  traceId: string,
  spanId: number,
  spanName: string
): Promise<any[] | undefined> {
  const maxTryCount = 0;
  const inputToMatch = input.toLocaleLowerCase().trim();

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: input },
  ];

  for (let index = 0; index < maxTryCount + 1; index++) {
    logger.help(
      `translate chunk. traceId: ${traceId}, spanId: ${spanId}, spanName: ${spanName}`
    );
    spanId++;
    const fullSpanName =
      index > 0 ? `${spanName} (Retry ${index + 1})` : spanName;
    const chatCompletion = await portkey.chat.completions.create(
      {
        stream: true,
        messages,
        model: process.env.LLM_MODEL,
        max_tokens: 16384,
        temperature: 0.2,
        thinking: { type: "disabled" },
      },
      {
        traceId,
        spanId,
        spanName: fullSpanName,
      }
    );

    let logged = 0;
    let content = "";
    for await (const chunk of chatCompletion) {
      const chunkContent = chunk.choices[0].delta?.content || "";
      content += chunkContent;
      const lines = content.split("\n").slice(logged, -1);
      if (lines.length) {
        logger.info(lines.join("\n"));
        logged += lines.length;
      }
    }
    const lines = content.split("\n").slice(logged);
    if (lines.length) logger.info(lines.join("\n"));

    // 检测解析结果
    const parsedResult = parse(content);
    if (match(inputToMatch, parsedResult)) return parsedResult;
  }
}

export async function translate(words: string[]) {
  const traceId = uuidv4();
  const maxChunkSize = 3000;

  const chunks = [];
  let chunk = "";
  for (const word of words) {
    chunk += " " + word;
    if (chunk.length >= maxChunkSize && word.match(/[.?!]$/)) {
      chunks.push(chunk.substring(1));
      chunk = "";
    }
  }
  if (chunk.length > 0) {
    chunks.push(chunk.substring(1));
  }

  for (const chunk of chunks) {
    logger.info(chunk);
  }

  let result = [];
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    const parsed = await tryCompletion(
      chunk,
      traceId,
      index * 100,
      `Translate chunk ${index + 1} of ${chunks.length}`
    );
    if (parsed) {
      result.push(...parsed);
    } else {
      throw new Error("Failed to translate chunk");
    }
  }

  return result;
}
