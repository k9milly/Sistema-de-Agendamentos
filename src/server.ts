import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({
    logger: true // Isso mostra no console cada requisição que chega
});

const prisma = new PrismaClient();

// ROTA 1: Teste básico
fastify.get('/ping', async () => {
    return { message: 'pong' };
});

// ROTA 2: Listar todos os usuários (para testar o banco)
fastify.get('/users', async (request, reply) => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        reply.status(500).send({ error: "Erro ao buscar usuários" });
    }
});

// ROTA 3: Criar um novo usuário
fastify.post('/users', async (request, reply) => {
    const { name, email, role } = request.body as any;

    try {
        const newUser = await prisma.user.create({
            data: { name, email, role }
        });
        return reply.status(201).send(newUser);
    } catch (error) {
        return reply.status(400).send({ error: "E-mail já cadastrado ou dados inválidos" });
    }
});

// Função para iniciar o servidor
const start = async () => {
    try {
        await fastify.listen({ port: 3333 });
        console.log("🚀 Servidor rodando em http://localhost:3333");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
