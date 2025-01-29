import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createGoal } from '../../functions/create-goal';

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  // Definindo o schema Zod
  const schema = z.object({
    title: z.string(),
    desiredWeeklyFrequency: z.number().int().min(1).max(7),
  });

  // Rota POST para criar um goal
  app.post(
    '/goals',
    {
      schema: {
        body: schema, // Usando o schema diretamente aqui
      },
    },
    async (request) => {
      // Inferindo o tipo de request.body usando z.infer
      const { title, desiredWeeklyFrequency } = request.body as z.infer<typeof schema>;

      // Chamando a função para criar o goal
      await createGoal({
        title,
        desiredWeeklyFrequency,
      });
    }
  );
};
