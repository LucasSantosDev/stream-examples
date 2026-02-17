import { pipeline } from 'node:stream/promises';
import { setTimeout } from 'node:timers/promises';

async function * myCustomReadable() {
    await setTimeout(1000);
    yield Buffer.from('Hello World');
    await setTimeout(1000);
    yield Buffer.from('World Hello');
}

async function * myCustomTransform(stream: AsyncGenerator<Buffer>) {
    for await (const chunk of stream) {
        yield chunk.toString().replace(/\s/, '_').toUpperCase();
    }
}

async function * myCustomWritable(stream: AsyncGenerator<Buffer>) {
    for await (const chunk of stream) {
        console.log('[writable]', chunk.toString());
    }
}

async function * myCustomDuplex(stream: AsyncGenerator<Buffer>) {
    let bytesRead = 0;
    const wholeString: string[] = [];
    for await (const chunk of stream) {
        console.log('[duplex writable]', chunk);
        bytesRead += chunk.length;
        wholeString.push(chunk);
    }

    yield `wholeString: ${wholeString.join()}`;
    yield `bytesRead: ${bytesRead}`;
}

await pipeline(myCustomReadable, myCustomTransform, myCustomDuplex, myCustomWritable);
