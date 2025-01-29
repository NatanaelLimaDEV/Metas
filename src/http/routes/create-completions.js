"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletionRoute = void 0;
const zod_1 = require("zod");
const create_goal_completion_1 = require("../../functions/create-goal-completion");
// A biblioteca Zod garante que a requisição tenha um valor válido. 
const createCompletionRoute = async (app) => {
    // Definindo o schema Zod para o corpo da requisição
    const schema = zod_1.z.object({
        goalId: zod_1.z.string(),
    });
    app.post('/completions', {
        schema: {
            body: schema, // Usando o schema aqui
        },
    }, async (request) => {
        // Inferindo o tipo de request.body usando z.infer
        const { goalId } = request.body;
        await (0, create_goal_completion_1.createGoalCompletion)({
            goalId,
        });
    });
};
exports.createCompletionRoute = createCompletionRoute;
