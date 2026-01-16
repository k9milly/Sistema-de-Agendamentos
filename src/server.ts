import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import cors from '@fastify/cors'

const fastify = Fastify({
    logger: true // Isso mostra no console cada requisição que chega
});

fastify.register(cors, {
    origin: true
})

const prisma = new PrismaClient();

// Teste básico
fastify.get('/ping', async () => {
    return { message: 'pong' };
});

// Listar todos os usuários (para testar o banco)
fastify.get('/users', async (request, reply) => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        reply.status(500).send({ error: "Erro ao buscar usuários" });
    }
});

// Criar um novo usuário
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

// Criar um Agendamento
fastify.post('/appointments', async (request, reply) => {
    const { startsAt, endsAt, clientId, providerId } = request.body as any;

    const newStart = new Date(startsAt);
    const newEnd = new Date(endsAt);

    // Valida se a data é retroativa
    if (newStart < new Date()) {
        return reply.status(400).send({ error: "Não é possível agendar no passado!" });
    }

    try {
        // BUSCA CONFLITOS
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                providerId: providerId, // Filtra pelo mesmo prestador
                AND: [
                    {
                        // O início do novo agendamento é antes do fim de um existente
                        startsAt: { lt: newEnd },
                    },
                    {
                        // O fim do novo agendamento é depois do início de um existente
                        endsAt: { gt: newStart },
                    },
                ],
            },
        });

        // SE ENCONTRAR, BLOQUEIA
        if (conflictingAppointment) {
            return reply.status(400).send({
                error: "Horário indisponível! Este prestador já possui um agendamento neste período."
            });
        }

        // SE ESTIVER LIVRE, CRIA
        const appointment = await prisma.appointment.create({
            data: {
                startsAt: newStart,
                endsAt: newEnd,
                clientId,
                providerId,
            },
        });

        return reply.status(201).send(appointment);

    } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Erro interno ao processar o agendamento." });
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
