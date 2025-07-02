export class Parser {
  sentences = [];
  current = {};
  pendingToken = "";
  state = "start_of_line";
  property = "";
  lastIndex = 0;
  readLength = 0;

  constructor() {}

  newKeyword(keyword, index) {
    if (keyword === "sentence") {
      this.lastIndex = index - 9 + this.readLength;
      this.current = {};
      this.sentences.push(this.current);
    } else if (keyword === "keyword") {
      const sentence = this.current;
      this.current = {};
      if (!sentence.keywords) sentence.keywords = [];
      sentence.keywords.push(this.current);
    }
  }

  append(input) {
    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      const char = input[i];
      if (charCode === 10) {
        this.state = "start_of_line";
        this.pendingToken = "";
        continue;
      }
      if (this.state === "invalid_line") {
        continue;
      }
      if (this.state === "end_of_line") {
        continue;
      }
      // 如果当前状态是行首，则根据字符类型设置状态
      if (this.state === "start_of_line") {
        if (charCode === 91) {
          this.state = "read_keyword";
        } else if (
          (charCode > 64 && charCode < 91) ||
          (charCode > 96 && charCode < 123)
        ) {
          this.state = "read_property";
          this.pendingToken = char;
        } else {
          this.state = "invalid_line";
        }
      } else if (this.state === "read_keyword") {
        if (charCode === 93) {
          this.state = "end_of_line";
          if (this.pendingToken) {
            this.newKeyword(this.pendingToken, i);
          }
          this.pendingToken = "";
        } else {
          this.pendingToken += char;
        }
      } else if (this.state === "read_property") {
        if (charCode === 58) {
          if (this.current && this.pendingToken) {
            this.property = this.pendingToken;
            this.current[this.property] = "";
            this.state = "read_value";
          } else {
            this.state = "end_of_line";
          }
          this.pendingToken = "";
        } else {
          this.pendingToken += char;
        }
      } else if (this.state === "read_value") {
        if (this.pendingToken || charCode !== 32) {
          this.pendingToken += char;
          this.current[this.property] = this.pendingToken.trim();
        }
      }
    }
    this.readLength += input.length;
  }

  get() {
    return {
      state: this.state,
      property: this.property,
      pendingToken: this.pendingToken,
      sentences: [...this.sentences],
      readLength: this.readLength,
      lastIndex: this.lastIndex,
    };
  }
}
