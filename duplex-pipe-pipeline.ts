import { Duplex, pipeline } from 'node:stream';
import { createWriteStream, createReadStream } from 'node:fs';
import { Transform } from 'node:stream';
import { promisify } from 'node:util';

// ------ EXAMPLE 1 --------

// Duplex: stream que permite leitura e escrita ao mesmo tempo.
const stream = Duplex.from({
    readable: createReadStream('input.txt'),
    writable: createWriteStream('output-pipe.txt'),
});

// pipe(): conecta uma stream de saída diretamente na entrada de outra.
stream.pipe(stream);

// ------ EXAMPLE 2 --------

const transformStream = new Transform({
    transform: (chunk, encoding, callback) => {
        callback(null, chunk.toString().toUpperCase());
    },
});

// pipeline(): conecta várias streams como o .pipe(), mas com tratamento automático de erros e encerramento seguro.
pipeline(createReadStream('input.txt'), transformStream, createWriteStream('output-pipeline.txt'), (err) => {
    if (err) {
        console.error(err);
    }
});

// ------ EXAMPLE 3 --------

const transformStreamAsync = new Transform({
    transform: (chunk, encoding, callback) => {
        callback(null, chunk.toString().toUpperCase());
    },
});

// promisify(): converte uma função callback-based em uma função assíncrona.
const pipelineAsync = promisify(pipeline);

pipelineAsync(createReadStream('input.txt'), transformStreamAsync, createWriteStream('output-pipeline-async.txt'))
    .then(() => {
        console.log('Pipeline executado com sucesso async');
    })
    .catch((err) => {
        console.error(err);
    });

(async () => {
    try {
        const transformStreamAsync2 = new Transform({
            transform: (chunk, encoding, callback) => {
                callback(null, chunk.toString().toUpperCase());
            },
        });
        
        await pipelineAsync(createReadStream('input.txt'), transformStreamAsync2, createWriteStream('output-pipeline-async.txt'))       

        console.log('Pipeline executado com sucesso async');
    } catch (error) {
        console.error(error);
    }
})();
