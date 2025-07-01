class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
  }

  isDigit(char) {
    return char >= "0" && char <= "9";
  }

  isWhitespace(char) {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  skipWhitespace() {
    while (
      this.pos < this.input.length &&
      this.isWhitespace(this.input[this.pos])
    ) {
      this.pos++;
    }
  }

  // nextToken 现在需要返回一个标志，表示是否成功读取
  peekNextChar() {
    if (this.pos < this.input.length) {
      return this.input[this.pos];
    }
    return null;
  }

  nextToken() {
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return { type: "EOF", value: null, complete: true }; // End Of File
    }

    let char = this.input[this.pos];

    switch (char) {
      case "{":
        this.pos++;
        return { type: "LBRACE", value: "{", complete: true };
      case "}":
        this.pos++;
        return { type: "RBRACE", value: "}", complete: true };
      case "[":
        this.pos++;
        return { type: "LBRACKET", value: "[", complete: true };
      case "]":
        this.pos++;
        return { type: "RBRACKET", value: "]", complete: true };
      case ":":
        this.pos++;
        return { type: "COLON", value: ":", complete: true };
      case ",":
        this.pos++;
        return { type: "COMMA", value: ",", complete: true };
      case '"':
        return this.readString();
      default:
        if (this.isDigit(char) || char === "-") {
          return this.readNumber();
        }
        if (char === "t" || char === "f" || char === "n") {
          return this.readKeyword();
        }
        // 如果是无法识别的字符，为了容错，我们直接跳过并尝试下一个
        // 或者返回一个 UNKNOWN 类型，让 parser 去处理
        this.pos++; // 跳过未知字符
        return { type: "UNKNOWN", value: char, complete: true }; // 标记为完整，但类型未知
    }
  }

  // 修改 readString: 即使没有闭合引号也返回已读取的部分
  readString() {
    let start = this.pos;
    this.pos++; // 跳过开头的双引号
    let value = "";
    let complete = true;

    while (this.pos < this.input.length && this.input[this.pos] !== '"') {
      if (this.input[this.pos] === "\\") {
        this.pos++; // 跳过反斜杠
        if (this.pos < this.input.length) {
          // 如果反斜杠后有字符，则添加到值中
          value += this.input[this.pos];
        } else {
          complete = false; // 反斜杠后没有字符，字符串不完整
          break;
        }
      } else {
        value += this.input[this.pos];
      }
      this.pos++;
    }

    if (this.pos >= this.input.length || this.input[this.pos] !== '"') {
      complete = false; // 字符串未闭合
    } else {
      this.pos++; // 跳过末尾的双引号
    }
    return { type: "STRING", value: value, complete: complete };
  }

  // 修改 readNumber: 即使数字不完整也返回已读取的部分
  readNumber() {
    let start = this.pos;
    let complete = true;
    while (
      this.pos < this.input.length &&
      (this.isDigit(this.input[this.pos]) ||
        this.input[this.pos] === "." ||
        this.input[this.pos] === "-" ||
        this.input[this.pos].toLowerCase() === "e" ||
        this.input[this.pos] === "+")
    ) {
      // 允许 '+' 用于科学计数法
      this.pos++;
    }
    let numberStr = this.input.substring(start, this.pos);

    // 这里可以添加更复杂的数字有效性检查，目前只检查是否为空
    if (numberStr.length === 0 || isNaN(parseFloat(numberStr))) {
      complete = false; // 无法解析为有效数字
      return { type: "NUMBER", value: undefined, complete: complete };
    }
    return { type: "NUMBER", value: parseFloat(numberStr), complete: complete };
  }

  // readKeyword 保持不变，因为关键字必须是精确匹配
  readKeyword() {
    let start = this.pos;
    if (this.input.substring(start, start + 4) === "true") {
      this.pos += 4;
      return { type: "BOOLEAN", value: true, complete: true };
    }
    if (this.input.substring(start, start + 5) === "false") {
      this.pos += 5;
      return { type: "BOOLEAN", value: false, complete: true };
    }
    if (this.input.substring(start, start + 4) === "null") {
      this.pos += 4;
      return { type: "NULL", value: null, complete: true };
    }
    // 如果关键字不完整，这里会尝试匹配最长的可能前缀，并将其视为不完整的关键字或未知
    // 为了简化，这里仍然抛出错误，或者可以返回一个特殊类型表示未识别的文本
    // 实际的健壮性解析器会有一个更复杂的恢复策略
    let remaining = this.input.substring(start);
    if (
      "true".startsWith(remaining) ||
      "false".startsWith(remaining) ||
      "null".startsWith(remaining)
    ) {
      // 假设它是这些关键字的不完整版本
      this.pos = this.input.length; // 消耗掉剩余所有字符
      return { type: "INCOMPLETE_KEYWORD", value: undefined, complete: false };
    }
    throw new Error(`Unexpected keyword at position ${start}`);
  }
}

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = null;
    this.advance(); // 预读第一个词法单元
  }

  // 获取下一个词法单元并更新 currentToken
  advance() {
    this.currentToken = this.lexer.nextToken();
  }

  // 尝试匹配期望的 token 类型。如果匹配成功，则消耗并返回 true；否则不消耗并返回 false。
  match(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.advance();
      return true;
    }
    return false;
  }

  // 解析 JSON 值
  parseValue() {
    switch (this.currentToken.type) {
      case "LBRACE":
        return this.parseObject();
      case "LBRACKET":
        return this.parseArray();
      case "STRING": {
        const value = this.currentToken.value;
        const complete = this.currentToken.complete;
        this.advance();
        // 如果字符串不完整，返回 undefined 或者一个标记值
        return complete ? value : undefined; // 根据需求决定返回什么
      }
      case "NUMBER": {
        const value = this.currentToken.value;
        const complete = this.currentToken.complete;
        this.advance();
        return complete ? value : undefined;
      }
      case "BOOLEAN": {
        const value = this.currentToken.value;
        this.advance();
        return value;
      }
      case "NULL": {
        const value = this.currentToken.value;
        this.advance();
        return value;
      }
      case "INCOMPLETE_KEYWORD": {
        this.advance();
        return undefined; // 不完整的关键字视为 undefined
      }
      case "UNKNOWN": {
        // 遇到未知字符，尝试跳过
        this.advance();
        return undefined; // 无法解析的值视为 undefined
      }
      case "EOF": // 如果遇到 EOF 且还在期望值，返回 undefined
        return undefined;
      default:
        // 对于其他未知或不期望的 token，返回 undefined 并尝试跳过
        this.advance(); // 尝试跳过
        return undefined;
    }
  }

  // 解析 JSON 对象
  parseObject() {
    this.match("LBRACE"); // 尝试匹配 '{'，不匹配也不报错

    const obj = {};
    let firstProperty = true;

    // 持续解析键值对直到遇到 '}' 或 EOF
    while (
      this.currentToken.type !== "RBRACE" &&
      this.currentToken.type !== "EOF"
    ) {
      // 允许末尾逗号，或在属性值解析错误后继续
      if (!firstProperty && this.match("COMMA")) {
        // 如果逗号后面立即是 } 或 EOF，则认为是末尾逗号，跳过
        if (
          this.currentToken.type === "RBRACE" ||
          this.currentToken.type === "EOF"
        ) {
          break;
        }
      } else if (!firstProperty && this.currentToken.type !== "COMMA") {
        // 如果不是第一个属性，也没有逗号，但也不是 }，可能格式错误，尝试跳过
        // 例如：{"a":1 "b":2} 缺少逗号
        // 为了容错，这里可以决定是跳过还是认为结构结束
        // 这里我们假设如果不是逗号也不是右括号，就认为对象可能结束了
        // 或者更复杂的：尝试性地跳过直到找到下一个可能是键或右括号的符号
        // 简化处理：如果没有逗号，就认为遇到非键或非结束符号，尝试跳过直到能识别的下一个模式
        if (this.currentToken.type !== "STRING") {
          // 如果下一个不是字符串（键），可能是格式错误
          // 尝试跳过直到找到下一个可能的键或右括号
          while (
            this.currentToken.type !== "STRING" &&
            this.currentToken.type !== "RBRACE" &&
            this.currentToken.type !== "EOF"
          ) {
            this.advance();
          }
          if (this.currentToken.type === "EOF") break; // 避免死循环
        }
      }
      firstProperty = false;

      let key = undefined;
      if (this.currentToken.type === "STRING") {
        key = this.currentToken.value;
        this.advance(); // 消耗键字符串
      } else if (
        this.currentToken.type === "EOF" ||
        this.currentToken.type === "RBRACE" ||
        this.currentToken.type === "COMMA"
      ) {
        // 如果在期望键的位置遇到 EOF, }, 或逗号，说明没有键了
        break;
      } else {
        this.advance(); // 跳过这个不合法的 token
        continue; // 继续下一个循环迭代
      }

      // 尝试匹配 ':'
      if (this.match("COLON")) {
        // 如果匹配到冒号，解析值
        obj[key] = this.parseValue();
      } else {
        // 如果没有冒号，值视为 undefined
        obj[key] = undefined;
        // 为了容错，我们不抛出错误，而是尝试继续解析下一个键值对
      }
    }
    this.match("RBRACE"); // 尝试匹配 '}'，不匹配也不报错
    return obj;
  }

  // 解析 JSON 数组
  parseArray() {
    this.match("LBRACKET"); // 尝试匹配 '['，不匹配也不报错
    const arr = [];
    let firstElement = true;

    // 持续解析元素直到遇到 ']' 或 EOF
    while (
      this.currentToken.type !== "RBRACKET" &&
      this.currentToken.type !== "EOF"
    ) {
      // 允许末尾逗号
      if (!firstElement && this.match("COMMA")) {
        if (
          this.currentToken.type === "RBRACKET" ||
          this.currentToken.type === "EOF"
        ) {
          break;
        }
      } else if (!firstElement && this.currentToken.type !== "COMMA") {
        // 缺少逗号
        // 尝试跳过直到找到下一个可能是值的符号或右括号
        while (
          this.currentToken.type !== "LBRACE" &&
          this.currentToken.type !== "LBRACKET" &&
          this.currentToken.type !== "STRING" &&
          this.currentToken.type !== "NUMBER" &&
          this.currentToken.type !== "BOOLEAN" &&
          this.currentToken.type !== "NULL" &&
          this.currentToken.type !== "RBRACKET" &&
          this.currentToken.type !== "EOF"
        ) {
          this.advance();
        }
        if (this.currentToken.type === "EOF") break;
      }
      firstElement = false;

      const value = this.parseValue();
      if (value !== undefined || this.currentToken.type === "EOF") {
        // 只有当解析出有效值或到末尾才添加
        arr.push(value);
      } else {
        // 如果 parseValue 返回 undefined 且不是 EOF，说明遇到了一个无法解析的 token
        // 继续循环，尝试解析下一个
      }
    }
    this.match("RBRACKET"); // 尝试匹配 ']'，不匹配也不报错
    return arr;
  }

  // 主解析入口
  parse() {
    // 如果输入是空的，或者以空白符结尾，直接返回空对象
    if (this.currentToken.type === "EOF" && this.lexer.pos === 0) return {};
    const result = this.parseValue();
    return result;
  }
}

// 完整的容错 JSON 解析函数
export function customTolerantParseJSON(jsonString) {
  const lexer = new Lexer(jsonString);
  const parser = new Parser(lexer);
  return parser.parse();
}