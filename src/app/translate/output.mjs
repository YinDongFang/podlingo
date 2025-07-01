let lines = 0;

export  function append(content) {
  process.stdout.write(`\x1B[K${content}\n`);
  lines += content.split("\n").length;
}

export function clear() {
  if (lines === 0) return;
  process.stdout.write(`\x1B[${lines}A`);
  lines = 0;
}
