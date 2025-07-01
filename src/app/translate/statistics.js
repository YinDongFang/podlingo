import { append, clear } from "./output.js";

export class Statistics {
  constructor(total, chunkSize) {
    this.startTime = Date.now();
    this.total = total;
    this.chunkSize = chunkSize;
    this.chunkCount = 0;
    this.currentChunkSize = chunkSize;
    this.chunkStartTime = Date.now();

    console.log(`- 开始处理 ${total} 项...`);
  }

  chunk() {
    this.chunkCount++;
    this.currentChunkSize = Math.min(
      this.chunkSize,
      this.total - this.chunkCount * this.chunkSize
    );
    this.chunkStartTime = Date.now();

    console.log(
      `- Chunk ${this.chunkCount} of ${Math.ceil(this.total / this.chunkSize)}`
    );
    console.log(`- 开始时间: ${new Date().toLocaleTimeString()}`);
  }

  update(count) {
    if (count === 0) return;

    clear();

    const progress = Math.round((count / this.chunkSize) * 100);
    const elapsedTime = (Date.now() - this.chunkStartTime) / 1000;
    const speed = (count / elapsedTime).toFixed(1);
    const progressBar =
      "█".repeat(Math.floor(progress / 5)) +
      "░".repeat(20 - Math.floor(progress / 5));

    // 清除当前行并显示进度
    append(
      `📊 进度: [${progressBar}] ${progress}% (${count}/${this.chunkSize}) | ⚡ ${speed}/s`
    );
  }

  end(count) {
    this.totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.avgSpeed = (count / parseFloat(this.totalTime)).toFixed(1);

    console.log(`🎉 任务完成！`);
    console.log(`📈 统计信息:`);
    console.log(` • 共完成: ${count}/${this.total}`);
    console.log(` • 总耗时: ${this.totalTime} s`);
    console.log(` • 平均速度: ${this.avgSpeed}/s`);
    console.log(` • 完成时间: ${new Date().toLocaleTimeString()}`);
  }
}
