import { Portkey } from "portkey-ai";
import { append } from "./output.mjs";
import { Statistics } from "./statistics.mjs";
import { load } from "js-yaml";
import { v4 as uuidv4 } from "uuid";

const prompt = `## Goals
- 根据语义断句，逗号也可以断句，逐句翻译给出的文本，每句一定不能超过20个单词！
- 注意判断上下文，避免内容缺失，不要省略任何单词
- 返回的en字段必须和原文保持完全一致，不能缺失任何字母或标点符号
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

// const openai = new OpenAI({
//   apiKey: process.env.API_KEY,
//   baseURL: process.env.BASE_URL,
// });

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
});

async function* continueCompletion(input, unitStart) {
  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: input },
  ];

  const traceId = uuidv4();
  let full_content = "";
  let spanId = 0;
  while (true) {
    spanId++;
    let finish_reason;
    let current_content = "";
    const spanName = `Translate Chunk ${spanId}`;
    const chatCompletion = await portkey.chat.completions.create(
      {
        stream: true,
        messages,
        model: process.env.LLM_MODEL,
        max_tokens: 16384,
      },
      {
        traceId,
        spanId,
        spanName,
      }
    );

    for await (const chunk of chatCompletion) {
      const chunkContent = chunk.choices[0].delta.content || "";
      finish_reason = chunk.choices[0].finish_reason;
      current_content += chunkContent;

      yield full_content + current_content;
    }

    console.log(`trace_id: ${traceId}
span_id: ${spanId}
span_name: ${spanName}
finish_reason: ${finish_reason}\n`);

    if (finish_reason === "stop") {
      full_content += current_content;
      return full_content;
    }

    const lastSentenceStartIndex = current_content.lastIndexOf(unitStart);
    current_content = current_content.substring(0, lastSentenceStartIndex);
    full_content += current_content;
    messages.push(
      { role: "assistant", content: current_content },
      { role: "user", content: "继续" }
    );
  }
}

function parse(content) {
  let yaml = content.startsWith("```yaml") ? content.substring(7) : content;
  if (!yaml.endsWith('"') && !yaml.endsWith("```")) yaml += '"';

  try {
    const result = load(yaml);
    return Array.isArray(result) ? result : null;
  } catch {
    return null;
  }
}

export async function* translate(input) {
  const statistics = new Statistics(input.length);
  const result = await continueCompletion(input, "- en");

  let parsedResult = [];
  for await (const content of result) {
    parsedResult = parse(content) || parsedResult;

    const count = parsedResult
      .filter((sentence) => sentence?.en)
      .reduce((count, { en }) => count + en.length + 1, -1);
    const loaded = Math.max(count, 0);
    statistics.update(loaded);

    yield { loaded, total: input.length };

    if (parsedResult.length > 0) {
      const latestSentence = parsedResult[parsedResult.length - 1];
      if (latestSentence?.zh) {
        append(`📝 "${latestSentence.zh}"`);
        if (latestSentence.keyword?.length > 0)
          append(`🔑 包含 ${latestSentence.keyword.length} 个关键词解释`);
      }
    }
  }

  statistics.end();

  yield parsedResult;
}
