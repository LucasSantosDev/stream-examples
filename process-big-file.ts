import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { performance } from "node:perf_hooks";

function makeReadable({ totalItems, chunkSize }) {
  let i = 0;

  return new Readable({
    read() {
      if (i >= totalItems) return this.push(null);

      while (i < totalItems) {
          let buf = "";
          let n = 0;

          while (i < totalItems && n < chunkSize) {
            buf += String(i++) + "\n";
            n++;
          }

          const ok = this.push(buf);
          if (!ok) return;
      }
    },
  });
}

function makeTransform() {
  return new Transform({
    transform(chunk, _enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    },
  });
}

function makeWritable(counter) {
  return new Writable({
    write(chunk, _enc, cb) {
      counter.bytes += chunk.length;
      cb();
    },
  });
}

async function runCase({ label, totalItems, chunkSize }) {
  const counter = { bytes: 0 };

  const readable = makeReadable({ totalItems, chunkSize });
  const transform = makeTransform();
  const writable = makeWritable(counter);

  const start = performance.now();
  await pipeline(readable, transform, writable);
  const end = performance.now();

  const seconds = (end - start) / 1000;
  const gb = counter.bytes / 1024 / 1024 / 1024;
  const mb = counter.bytes / 1024 / 1024
  const mbps = mb / seconds;

  console.log(`\n=== ${label} ===`);
  console.log(`Items: ${totalItems.toLocaleString()}`);
  console.log(`Chunk items: ${chunkSize.toLocaleString()}`);
  console.log(`Bytes: ${counter.bytes.toLocaleString()} (~${gb.toFixed(2)} GB)`);
  console.log(`Time: ${seconds.toFixed(3)} s`);
  console.log(`Throughput: ${mbps.toFixed(2)} MB/s`);
}

(async () => {
  const totalItems = 150_000_000;

  await runCase({
    label: "BIG chunks (1k items/chunk)",
    totalItems,
    chunkSize: 1_000,
  });
})();
