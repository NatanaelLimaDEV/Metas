import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createGoalCompletion } from '../../functions/create-goal-completion';

// A biblioteca Zod garante que a requisição tenha um valor válido. 
export const createCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  // Definindo o schema Zod para o corpo da requisição
  const schema = z.object({
    goalId: z.string(),
  });

  app.post(
    '/completions',
    {
      schema: {
        body: schema, // Usando o schema aqui
      },
    },
    async (request) => {
      // Inferindo o tipo de request.body usando z.infer
      const { goalId } = request.body as z.infer<typeof schema>;

      await createGoalCompletion({
        goalId,
      });
    }
  );
};
