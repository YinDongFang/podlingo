import { append, clear } from "./output.mjs";

export class Statistics {
  constructor(total) {
    this.startTime = Date.now();
    this.total = total;

    console.log(`- 开始时间: ${new Date().toLocaleTimeString()}`);
  }

  update(count) {
    this.count = count;
    if (count === 0) return;

    clear();

    const progress = Math.round((count / this.total) * 100);
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const speed = (count / elapsedTime).toFixed(1);
    const progressBar =
      "█".repeat(Math.floor(progress / 5)) +
      "░".repeat(20 - Math.floor(progress / 5));

    // 清除当前行并显示进度
    append(
      `📊 进度: [${progressBar}] ${progress}% (${count}/${this.total}) | ⚡ ${speed}/s`
    );
  }

  end() {
    this.totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.avgSpeed = (this.count / parseFloat(this.totalTime)).toFixed(1);

    console.log(`🎉 任务完成！`);
    console.log(`📈 统计信息:`);
    console.log(` • 总字符: ${this.count}/${this.total}`);
    console.log(` • 总耗时: ${this.totalTime} s`);
    console.log(` • 平均速度: ${this.avgSpeed}/s`);
    console.log(` • 完成时间: ${new Date().toLocaleTimeString()}`);
  }
}
