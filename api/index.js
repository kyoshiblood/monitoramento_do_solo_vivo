
const fastify = require('fastify');
const path = require('node:path');
const fs = require("node:fs");
const server = fastify({ logger: true });
const cors = require('@fastify/cors');
const fastifyStatic = require('@fastify/static');

server.register(cors, { origin: '*' });

const pastaPublic = path.resolve(__dirname, "..", "public");

console.log("Pasta pública procurada:", pastaPublic);
console.log("Pasta existe?", fs.existsSync(pastaPublic));
server.register(fastifyStatic, {
    root: pastaPublic,
    prefix: "/"
});

let dadosSensores = null;

server.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});

server.post('/api/dados', async (request, reply) => {
    dadosSensores = {
        ...request.body,
        ultima_atualizacao: new Date().toISOString()
    };

    console.log('POST recebido:', dadosSensores);

    return { sucesso: true };
});

server.get('/api/dados', async (request, reply) => {
    if (!dadosSensores) {
        return reply.code(404).send({
            sucesso: false,
            mensagem: 'Nenhum dado recebido ainda.'
        });
    }

    return dadosSensores;
});

server.listen({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Servidor rodando em ${address}`);
});
