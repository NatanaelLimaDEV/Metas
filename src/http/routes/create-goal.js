"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalRoute = void 0;
const zod_1 = require("zod");
const create_goal_1 = require("../../functions/create-goal");
const createGoalRoute = async (app) => {
    // Definindo o schema Zod
    const schema = zod_1.z.object({
        title: zod_1.z.string(),
        desiredWeeklyFrequency: zod_1.z.number().int().min(1).max(7),
    });
    // Rota POST para criar um goal
    app.post('/goals', {
        schema: {
            body: schema, // Usando o schema diretamente aqui
        },
    }, async (request) => {
        // Inferindo o tipo de request.body usando z.infer
        const { title, desiredWeeklyFrequency } = request.body;
        // Chamando a função para criar o goal
        await (0, create_goal_1.createGoal)({
            title,
            desiredWeeklyFrequency,
        });
    });
};
exports.createGoalRoute = createGoalRoute;
